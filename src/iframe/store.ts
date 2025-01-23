import {devMode} from '../shared/dev-mode.ts'
import type {Player, PostSeed} from '../shared/save.ts'
import type {XY} from '../shared/types/2d.ts'
import type {
  InitDevvitMessage,
  PeerUpdatedMessage,
  PlayerSync
} from '../shared/types/message.ts'
import type {SID} from '../shared/types/sid.ts'
import type {UTCMillis} from '../shared/types/time.ts'
import {Spawner} from './spawner.ts'

export type PlayerState = {player: Player; sync: PlayerSync; xy: XY}

type SubscribeMap = {
  p1XY: Set<(xy: Readonly<XY>) => void>
  peerConnected: Set<(state: PlayerState) => void>
  peerDisconnected: Set<(state: PlayerState) => void>
  peerUpdated: Set<(msg: PeerUpdatedMessage) => void>
}

export class Store {
  debug: boolean = devMode
  readonly devPeerChan: BroadcastChannel | undefined = devMode
    ? new BroadcastChannel('dev')
    : undefined
  readonly promise: Promise<void>
  readonly on: Readonly<SubscribeMap> = {
    p1XY: new Set(),
    peerConnected: new Set(),
    peerDisconnected: new Set(),
    peerUpdated: new Set()
  }
  /** undefined until InitDevvitMessage. */
  p1!: PlayerState
  phaser!: Phaser.Game
  seed!: PostSeed
  spawner!: Spawner
  readonly #peers: {[sid: SID]: PlayerState} = {}
  #resolve!: () => void

  constructor() {
    this.promise = new Promise(resolve => (this.#resolve = resolve))
  }

  init(msg: InitDevvitMessage): void {
    this.debug = msg.debug
    const xy = {x: 100 - Math.random() * 200, y: 0} // to-do: should this be deterministic?
    this.p1 = {
      player: msg.p1,
      sync: {
        dir: {x: 0, y: 0},
        hits: {},
        time: 0 as UTCMillis,
        xy: {x: xy.x, y: xy.y}
      },
      xy: {x: xy.x, y: xy.y}
    }
    this.seed = msg.seed
    this.spawner = new Spawner(this)
    // Phaser.Math.RND.sow([`${msg.seed.seed}`])
    this.#resolve()
    if (this.debug) console.log(`${this.p1.player.profile.username} init`)
  }

  onPeerConnected(state: PlayerState): void {
    const joined = state.player.sid in this.#peers
    this.#peers[state.player.sid] = state
    if (!joined) for (const cb of this.on.peerConnected) cb(state)
  }

  onPeerDisconnected(state: PlayerState): void {
    const joined = state.player.sid in this.#peers
    delete this.#peers[state.player.sid]
    if (joined) for (const cb of this.on.peerDisconnected) cb(state)
  }

  onPeerUpdated(msg: PeerUpdatedMessage): void {
    for (const cb of this.on.peerUpdated) cb(msg)
  }

  get peers(): {readonly [sid: SID]: PlayerState} {
    return this.#peers
  }

  setP1XY(xy: Readonly<XY>): void {
    this.p1.xy.x = xy.x
    this.p1.xy.y = xy.y
    for (const cb of this.on.p1XY) cb(xy)
  }
}
