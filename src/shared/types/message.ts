import type {Player, PostSeed} from '../save.ts'
import type {XY} from './2d.ts'

/**
 * a message from blocks to the iframe. Init always arrived first, usually
 * followed by Connected.
 */
export type DevvitMessage =
  | {
      /**
       * configure iframe lifetime debug mode. this is by request in devvit but that
       * granularity doesn't make sense in the iframe.
       */
      debug: boolean
      p1: Player
      seed: PostSeed
      type: 'Init'
    }
  | {type: 'Connected'}
  | {type: 'Disconnected'}
  | {peer: Player; type: 'PeerJoin'}
  | {peer: Player; type: 'PeerLeave'}
  | PeerMessage

/** the devvit API wraps all messages from blocks to the iframe. */
export type DevvitSystemMessage = {
  data: {message: DevvitMessage}
  type?: 'devvit-message'
}

/** a message from the iframe to devvit. */
export type WebViewMessage =
  | {type: 'Listening'}
  | {p1: Player; type: 'NewGame'}
  | {p1: Player; type: 'Save'}
  | PeerMessage

/** a realtime message from another instance. */
export type PeerMessage = {type: 'Peer'; xy: XY; taps: XY[]} & RealtimeMessage

/** base realtime message sent or received. */
export type RealtimeMessage = {
  peer: Player
  /** message schema version. */
  version: number
}

/** message versions supported by this instance. */
export const realtimeVersion: number = 0
