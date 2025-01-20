import type {Player} from '../shared/save.ts'
import {minCanvasWH} from '../shared/theme.ts'
import type {
  DevvitMessage,
  DevvitSystemMessage,
  PeerMessage
} from '../shared/types/message.ts'
import type {Seed} from '../shared/types/seed.ts'
import {SID} from '../shared/types/sid.ts'
import {devProfiles} from './dev/dev-profiles.ts'
import {postWebViewMessage} from './mail.ts'
import {GameOver} from './scenes/game-over.ts'
import {Loading} from './scenes/loading.ts'
import {Preload} from './scenes/preload.ts'
import {Shmup} from './scenes/shmup.ts'
import {Title} from './scenes/title.ts'

export class Game {
  debug: boolean
  // to-do: compile-time constant to enable dead code removal.
  // to-do: spawn AI?
  /** development mode; no devvit. */
  readonly dev: boolean = location.port === '1234'
  readonly devPeerChan: BroadcastChannel | undefined = this.dev
    ? new BroadcastChannel('dev')
    : undefined
  /** undefined until Init message. */
  p1!: Player
  readonly peers: {[sid: SID]: Player} = {}
  readonly phaser: Phaser.Game
  readonly init: Promise<void>
  #init!: () => void

  constructor() {
    this.debug = this.dev
    this.init = new Promise(resolve => (this.#init = resolve))
    const config: Phaser.Types.Core.GameConfig = {
      backgroundColor: '#f00000', // to-do: fix.
      // height: '100%',
      width: minCanvasWH.w,
      height: minCanvasWH.h,
      pixelArt: true,
      physics: {default: 'arcade', arcade: {debug: true}},
      scale: {
        autoCenter: Phaser.Scale.CENTER_BOTH,
        mode: Phaser.Scale.EXPAND
        // zoom: Phaser.Scale.MAX_ZOOM
      },
      scene: [Preload, new Loading(this), Title, new Shmup(this), GameOver],
      type: Phaser.AUTO
      // width: '100%'
    }
    this.phaser = new Phaser.Game(config)
    this.phaser.scale.on(
      'resize',
      (
        gameSize: Phaser.Structs.Size,
        canvasSize: Phaser.Structs.Size,
        displaySize: Phaser.Structs.Size
      ) => this.#onResize(gameSize, canvasSize, displaySize)
    )
  }

  start(): void {
    addEventListener('message', ev => this.#onMsg(ev))
    postWebViewMessage(this, {type: 'Listening'})

    if (this.dev) {
      this.devPeerChan?.addEventListener('message', ev => {
        const msg: PeerMessage = ev.data
        if (!(msg.peer.sid in this.peers))
          this.#onDevMsg({type: 'PeerJoin', peer: msg.peer})
        this.#onDevMsg(ev.data)
      })

      const seed = Date.now()
      console.log(`seed=${seed}`)

      // get a deterministic delay. this will get reset in init with the same seed
      // which will cause the next calls to return the same sequence but that's ok.
      Phaser.Math.RND.sow([`${seed}`])

      const p1 = {
        profile: devProfiles[Phaser.Math.RND.integer() % devProfiles.length]!,
        sid: SID()
      }

      setTimeout(() => {
        this.#onDevMsg({
          debug: true,
          p1,
          seed: {seed: seed as Seed},
          type: 'Init'
        })
        setTimeout(() => {
          this.#onDevMsg({type: 'Connected'})
          setTimeout(
            () => this.#onDevMsg({type: 'PeerJoin', peer: p1}),
            Phaser.Math.RND.integer() % 1000
          )
        }, Phaser.Math.RND.integer() % 1000)
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

  async #onMsg(ev: MessageEvent<DevvitSystemMessage>): Promise<void> {
    // hack: filter unknown messages.
    if (ev.data.type !== 'devvit-message') return

    const msg = ev.data.data.message

    if (this.debug || (msg.type === 'Init' && msg.debug))
      console.log(`Game msg=${JSON.stringify(msg)}`)

    switch (msg.type) {
      case 'Init':
        this.debug = msg.debug
        this.p1 = msg.p1
        Phaser.Math.RND.sow([`${msg.seed.seed}`])
        if (this.debug) console.log(`${this.p1.profile.username} init`)
        this.#init()
        break
      case 'Connected':
        if (this.debug) console.log(`${this.p1.profile.username} connected`)
        break
      case 'Disconnected':
        if (this.debug) console.log(`${this.p1.profile.username} disconnected`)
        break
      case 'Peer':
        break
      case 'PeerJoin':
        if (this.debug) console.log(`${msg.peer.profile.username} joined`)
        this.peers[msg.peer.sid] = msg.peer
        break
      case 'PeerLeave':
        if (this.debug) console.log(`${msg.peer.profile.username} left`)
        delete this.peers[msg.peer.sid]
        break
      default:
        msg satisfies never
    }
  }

  #onResize(
    _gameSize: Phaser.Structs.Size,
    _canvasSize: Phaser.Structs.Size,
    _displaySize: Phaser.Structs.Size
  ): void {
    for (const scene of this.phaser.scene.getScenes()) {
      centerCam(scene)
    }
  }
}

export function centerCam(scene: Phaser.Scene): void {
  scene.cameras.main.x = (scene.scale.gameSize.width - minCanvasWH.w) / 2
  scene.cameras.main.y = (scene.scale.gameSize.height - minCanvasWH.h) / 2
}
