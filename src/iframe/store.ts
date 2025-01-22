import {devMode} from '../shared/dev-mode.ts'
import type {Player} from '../shared/save.ts'
import type {XY} from '../shared/types/2d.ts'
import type {PeerMessage, PlayerSync} from '../shared/types/message.ts'
import type {SID} from '../shared/types/sid.ts'

export type PlayerState = {player: Player; sync: PlayerSync; xy: XY}

type SubscribeMap = {
  onP1XY: Set<(xy: Readonly<XY>) => void>
  onPeerJoin: Set<(state: PlayerState) => void>
  onPeerLeave: Set<(state: PlayerState) => void>
  onPeerMessage: Set<(msg: PeerMessage) => void>
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
  readonly subscribe: Readonly<SubscribeMap> = {
    onP1XY: new Set(),
    onPeerJoin: new Set(),
    onPeerLeave: new Set(),
    onPeerMessage: new Set()
  }
  readonly #peers: {[sid: SID]: PlayerState} = {}

  constructor(init: Promise<void>) {
    this.init = init
  }

  onPeerJoin(state: PlayerState): void {
    const joined = state.player.sid in this.#peers
    this.#peers[state.player.sid] = state
    if (!joined) for (const cb of this.subscribe.onPeerJoin) cb(state)
  }

  onPeerLeave(state: PlayerState): void {
    const joined = state.player.sid in this.#peers
    delete this.#peers[state.player.sid]
    if (joined) for (const cb of this.subscribe.onPeerLeave) cb(state)
  }

  onPeerMessage(msg: PeerMessage): void {
    for (const cb of this.subscribe.onPeerMessage) cb(msg)
  }

  get peers(): {readonly [sid: SID]: PlayerState} {
    return this.#peers
  }

  setP1XY(xy: Readonly<XY>): void {
    this.p1.xy.x = xy.x
    this.p1.xy.y = xy.y
    for (const cb of this.subscribe.onP1XY) cb(xy)
  }
}
