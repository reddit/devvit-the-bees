import {
  Devvit,
  type JSONObject,
  type UseChannelResult,
  useChannel,
  useInterval
} from '@devvit/public-api'
import type {Player} from '../../shared/save.ts'
import type {RealtimeMessage} from '../../shared/types/message.ts'
import type {SID} from '../../shared/types/sid.ts'
import type {T3} from '../../shared/types/tid.ts'
import {type UTCMillis, utcMillisNow} from '../../shared/types/time.ts'
import {useState2} from './use-state2.ts'

Devvit.configure({realtime: true})

export type UseChannel2Opts<T extends RealtimeMessage & JSONObject> = {
  /**
   * Name of the channel. By default, messages broadcast to all posts. A T3
   * isolates messages to a post, a common name like 'default' broadcasts to all
   * users.
   */
  chan: T3 | string
  /** Duration of radio silence before a peer is considered offline. */
  disconnectMillis?: number
  p1: Player
  /**
   * The message schema version. Eg, 1. Only messages from clients sending the
   * matching version are accepted. The version must be incremented whenever a
   * breaking change is made to the message format.
   */
  version: number
  /** Called every time a message is received on this channel. */
  onMessage(msg: T): void
  onPeerJoin?: ((peer: Readonly<Player>) => void) | undefined
  onPeerLeave?: ((peer: Readonly<Player>) => void) | undefined
  /** Optional hook to be informed when the channel has connected. */
  onSubscribed?: (() => void | Promise<void>) | undefined
  /** Optional hook to be informed when the channel has disconnected. */
  onUnsubscribed?: (() => void | Promise<void>) | undefined
}

export type UseChannel2Result<T extends JSONObject> = UseChannelResult<T> & {
  peers: Readonly<PeerMap>
}

export type PeerMap = {
  [sid: SID]: {peered: UTCMillis; player: Readonly<Player>}
}

const defaultDisconnectMillis: number = 5_000
const disconnectIntervalMillis: number = 1_000

export function useChannel2<T extends JSONObject>(
  opts: Readonly<UseChannel2Opts<T & RealtimeMessage>>
): UseChannel2Result<T> {
  const [peers, setPeers] = useState2<PeerMap>({})
  const disconnectInterval = useInterval(() => {
    const now = utcMillisNow()
    const disconnectMillis = opts.disconnectMillis ?? defaultDisconnectMillis
    for (const peer of Object.values(peers)) {
      if (now - peer.peered > disconnectMillis) {
        setPeers(peers => {
          delete peers[peer.player.sid]
          return peers
        })
        opts.onPeerLeave?.(peer.player)
      }
    }
    if (!Object.keys(peers).length) disconnectInterval.stop()
  }, disconnectIntervalMillis)

  const chan = useChannel<T & RealtimeMessage>({
    name: opts.chan,
    onMessage(msg) {
      if (!(msg.peer.sid in peers)) {
        setPeers(peers => {
          peers[msg.peer.sid] = {player: msg.peer, peered: utcMillisNow()}
          return peers
        })
        opts.onPeerJoin?.(msg.peer)
      }
      // omit messages received from self (but update peer map first).
      if (msg.peer.sid === opts.p1.sid) return
      if (msg.version === opts.version) opts.onMessage(msg)
      else if (msg.version > opts.version)
        console.info(`ignored v${msg.version} message`)
    },
    onSubscribed() {
      disconnectInterval.start()
      opts.onSubscribed?.()
    },
    onUnsubscribed: opts.onUnsubscribed
  })

  return {
    status: chan.status,
    subscribe: () => chan.subscribe(),
    unsubscribe: () => chan.unsubscribe(),
    peers: peers,
    async send(msg) {
      chan.send({
        ...msg,
        peer: opts.p1,
        version: opts.version
      } satisfies RealtimeMessage)
    }
  }
}
