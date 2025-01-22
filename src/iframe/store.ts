import {devMode} from '../shared/dev-mode.ts'
import type {Player} from '../shared/save.ts'
import type {XY} from '../shared/types/2d.ts'
import type {PeerUpdatedMessage, PlayerSync} from '../shared/types/message.ts'
import type {SID} from '../shared/types/sid.ts'

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
  readonly init: Promise<void>
  /** undefined until Init message. */
  p1!: PlayerState
  phaser!: Phaser.Game
  readonly on: Readonly<SubscribeMap> = {
    p1XY: new Set(),
    peerConnected: new Set(),
    peerDisconnected: new Set(),
    peerUpdated: new Set()
  }
  readonly #peers: {[sid: SID]: PlayerState} = {}

  constructor(init: Promise<void>) {
    this.init = init
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
