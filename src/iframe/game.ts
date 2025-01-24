import {devMode} from '../shared/dev-mode.ts'
import {
  minCanvasWH,
  peerDefaultDisconnectMillis,
  peerDisconnectIntervalMillis,
  peerMaxSyncInterval
} from '../shared/theme.ts'
import {Throttle} from '../shared/throttle.ts'
import type {XY} from '../shared/types/2d.ts'
import {
  type DevvitMessage,
  type DevvitSystemMessage,
  type PeerUpdatedMessage,
  realtimeVersion
} from '../shared/types/message.ts'
import type {Seed} from '../shared/types/seed.ts'
import {SID} from '../shared/types/sid.ts'
import {type UTCMillis, utcMillisNow} from '../shared/types/time.ts'
import {devProfiles} from './dev/dev-profiles.ts'
import {postWebViewMessage} from './mail.ts'
import {GameOver} from './scenes/game-over.ts'
import {Loading} from './scenes/loading.ts'
import {Preload} from './scenes/preload.ts'
import {Shmup} from './scenes/shmup.ts'
import {Title} from './scenes/title.ts'
import {Store} from './store.ts'

export class Game {
  readonly store: Store

  #devPeerDisconnectInterval?: number

  constructor() {
    this.store = new Store()
    this.store.on.p1XY.add(xy => this.#onP1XY(xy))
    const config: Phaser.Types.Core.GameConfig = {
      backgroundColor: '#f00000', // to-do: fix.
      width: minCanvasWH.w,
      height: minCanvasWH.h,
      physics: {default: 'arcade'},
      scale: {autoCenter: Phaser.Scale.CENTER_BOTH, mode: Phaser.Scale.EXPAND},
      scene: [
        Preload,
        new Loading(this.store),
        new Title(this.store),
        new Shmup(this.store),
        GameOver
      ],
      type: Phaser.AUTO
    }
    this.store.phaser = new Phaser.Game(config)
    this.store.phaser.scale.on('resize', () => this.#onResize())
  }

  start(): void {
    addEventListener('message', ev => this.#onMsg(ev))
    postWebViewMessage(this.store, {type: 'Registered'})

    if (devMode) {
      this.store.devPeerChan?.addEventListener('message', ev => {
        const msg: PeerUpdatedMessage = ev.data
        if (
          msg.peer.sid !== this.store.p1?.player.sid &&
          !(msg.peer.sid in this.store.peers)
        )
          this.#onDevMsg({...msg, type: 'PeerConnected'})
        this.#onDevMsg(ev.data)
      })
      this.#devPeerDisconnectInterval = setInterval(() => {
        const now = utcMillisNow()
        for (const peer of Object.values(this.store.peers)) {
          if (now - peer.sync.time > peerDefaultDisconnectMillis)
            this.#onDevMsg({type: 'PeerDisconnected', peer: peer.player})
        }
      }, peerDisconnectIntervalMillis)

      const seedStr = new URL(location.href).searchParams.get('seed')
      const seed = seedStr ? Number.parseInt(seedStr) : Date.now()
      console.log(`seed=${seed}`)

      const p1 = {
        profile: devProfiles[Phaser.Math.RND.integer() % devProfiles.length]!,
        sid: SID()
      }

      // get a deterministic delay. this will get reset in init with the same seed
      // which will cause the next calls to return the same sequence but that's ok.
      Phaser.Math.RND.sow([`${seed}`])

      setTimeout(() => {
        this.#onDevMsg({
          debug: true,
          p1,
          seed: {seed: seed as Seed},
          type: 'Init'
        })
        setTimeout(
          () => this.#onDevMsg({type: 'Connected'}),
          Phaser.Math.RND.integer() % 1000
        )
      }, Phaser.Math.RND.integer() % 1000)
    }
  }

  #onDevMsg(msg: Readonly<DevvitMessage>): void {
    this.#onMsg(
      new MessageEvent<DevvitSystemMessage>('message', {
        data: {type: 'devvit-message', data: {message: msg}}
      })
    )
  }

  // to-do: should this be part of data store? I am doing so much data hacking here but it's all business logic.
  async #onMsg(ev: MessageEvent<DevvitSystemMessage>): Promise<void> {
    // hack: filter unknown messages.
    if (ev.data.type !== 'devvit-message') return

    const msg = ev.data.data.message

    // if (this.store.debug || (msg.type === 'Init' && msg.debug))
    //   console.log(`Game msg=${JSON.stringify(msg)}`)

    switch (msg.type) {
      case 'Init':
        this.store.init(msg)
        break
      case 'Connected':
        if (this.store.debug)
          console.log(`${this.store.p1.player.profile.username} connected`)
        this.#postP1PeerUpdated.schedule(utcMillisNow())
        break
      case 'Disconnected':
        if (this.store.debug)
          console.log(`${this.store.p1.player.profile.username} disconnected`)
        break
      case 'PeerConnected':
        if (this.store.debug) console.log(`${msg.peer.profile.username} joined`)
        this.store.onPeerConnected({
          player: msg.peer,
          sync: msg.sync,
          xy: msg.sync.xy
        })
        break
      case 'PeerDisconnected': {
        if (this.store.debug) console.log(`${msg.peer.profile.username} left`)
        const state = this.store.peers[msg.peer.sid]
        if (state) this.store.onPeerDisconnected(state)
        break
      }
      case 'PeerUpdated':
        // to-do: remove. why wasn't connect sent? was it missed?
        if (!(msg.peer.sid in this.store.peers))
          this.store.onPeerConnected({
            player: msg.peer,
            sync: msg.sync,
            xy: msg.sync.xy
          })

        this.store.peers[msg.peer.sid]!.sync = msg.sync
        this.store.onPeerUpdated(msg)
        break
      default:
        msg satisfies never
    }
  }

  #onP1XY(xy: Readonly<XY>): void {
    const now = utcMillisNow()
    const significant =
      Phaser.Math.Distance.Between(
        this.store.p1.sync.xy.x,
        this.store.p1.sync.xy.y,
        xy.x,
        xy.y
      ) > 5 ||
      now - this.store.p1.sync.time > peerMaxSyncInterval ||
      Object.keys(this.store.p1.sync.hits).length
    if (!significant) return
    this.#postP1PeerUpdated.schedule(now)
  }

  #onResize(): void {
    for (const scene of this.store.phaser.scene.getScenes()) centerCam(scene)
  }

  #postP1PeerUpdated = new Throttle((now: UTCMillis): void => {
    // to-do: dir.
    this.store.p1.sync.time = now
    this.store.p1.sync.xy = this.store.p1.xy
    postWebViewMessage(this.store, {
      type: 'PeerUpdated',
      peer: this.store.p1.player,
      sync: this.store.p1.sync,
      version: realtimeVersion
    })
    this.store.p1.sync.hits = {}
  }, 300) // to-do: extract.
}

export function centerCam(scene: Phaser.Scene): void {
  const cam = scene.cameras.main
  // to-do: fix me; this breaks follow cam.
  cam.scrollX = -(scene.scale.width - minCanvasWH.w) / 2
  cam.scrollY = -(scene.scale.height - minCanvasWH.h) / 2
}
