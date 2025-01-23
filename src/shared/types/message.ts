import type {Player, PostSeed} from '../save.ts'
import type {XY} from './2d.ts'
import type {EID} from './eid.ts'
import type {UTCMillis} from './time.ts'

/**
 * a message from blocks to the iframe. Init always arrived first, usually
 * followed by Connected.
 */
export type DevvitMessage =
  | InitDevvitMessage
  | {type: 'Connected'}
  | {type: 'Disconnected'}
  | (Omit<PeerUpdatedMessage, 'type'> & {type: 'PeerConnected'})
  | {peer: Player; type: 'PeerDisconnected'}
  | PeerUpdatedMessage

export type InitDevvitMessage = {
  /**
   * configure iframe lifetime debug mode. this is by request in devvit but that
   * granularity doesn't make sense in the iframe.
   */
  debug: boolean
  p1: Player
  seed: PostSeed
  type: 'Init'
}

/** the devvit API wraps all messages from blocks to the iframe. */
export type DevvitSystemMessage = {
  data: {message: DevvitMessage}
  type?: 'devvit-message'
}

/** a message from the iframe to devvit. */
export type WebViewMessage =
  /** iframe has registered a message listener. */
  | {type: 'Registered'}
  | {p1: Player; type: 'NewGame'}
  | {p1: Player; type: 'Save'}
  | PeerUpdatedMessage

/** a realtime message from another instance. */
export type PeerUpdatedMessage = {
  type: 'PeerUpdated'
  sync: PlayerSync
} & RealtimeMessage

// spawning, including waves, are deterministic. each player only spawns bullets for themselves
// but local bullets spawned from another player can damage current player. that's the resolution.
export type PlayerSync = {
  dir: XY
  hits: {[eid: EID]: number}
  time: UTCMillis
  xy: XY
}

/** base realtime message sent or received. */
export type RealtimeMessage = {
  peer: Player
  /** message schema version. */
  version: number
}

/** message versions supported by this instance. */
export const realtimeVersion: number = 0
