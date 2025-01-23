import {
  Devvit,
  type JSONObject,
  type UseChannelResult,
  useChannel,
  useInterval
} from '@devvit/public-api'
import type {Player} from '../../shared/save.ts'
import {
  peerDefaultDisconnectMillis,
  peerDisconnectIntervalMillis
} from '../../shared/theme.ts'
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
  /** Optional hook to be informed when the channel has connected. */
  onConnected?: (() => void | Promise<void>) | undefined
  /** Optional hook to be informed when the channel has disconnected. */
  onDisconnected?: (() => void | Promise<void>) | undefined
  onPeerConnected?: ((msg: T) => void) | undefined
  /** Called every time a message is received on this channel. */
  onPeerMessage(msg: T): void
  onPeerDisconnected?: ((peer: Readonly<Player>) => void) | undefined
  p1: Player
  /**
   * The message schema version. Eg, 1. Only messages from clients sending the
   * matching version are accepted. The version must be incremented whenever a
   * breaking change is made to the message format.
   */
  version: number
}

export type UseChannel2Result<T extends JSONObject> = UseChannelResult<T> & {
  peers: Readonly<PeerMap>
}

type PeerMap = {[sid: SID]: {time: UTCMillis; player: Readonly<Player>}}

export function useChannel2<T extends JSONObject>(
  opts: Readonly<UseChannel2Opts<T & RealtimeMessage>>
): UseChannel2Result<T> {
  // to-do: this is useful to report the number of current users but users don't
  // currently message from the title screen. add a special message?
  const [peers, setPeers] = useState2<PeerMap>({})
  const disconnectInterval = useInterval(() => {
    const now = utcMillisNow()
    const disconnectMillis =
      opts.disconnectMillis ?? peerDefaultDisconnectMillis
    for (const peer of Object.values(peers)) {
      if (now - peer.time > disconnectMillis) {
        setPeers(peers => {
          delete peers[peer.player.sid]
          return peers
        })
        opts.onPeerDisconnected?.(peer.player)
      }
    }
    if (!Object.keys(peers).length) disconnectInterval.stop()
  }, peerDisconnectIntervalMillis)

  const chan = useChannel<T & RealtimeMessage>({
    name: opts.chan,
    onMessage(msg) {
      if (msg.peer.sid === opts.p1.sid) return // omit messages from self.
      if (!(msg.peer.sid in peers)) {
        setPeers(peers => {
          peers[msg.peer.sid] = {player: msg.peer, time: utcMillisNow()}
          return peers
        })
        opts.onPeerConnected?.(msg)
      }
      if (msg.version === opts.version) opts.onPeerMessage(msg)
      else if (msg.version > opts.version)
        console.info(`ignored v${msg.version} message`)
    },
    onSubscribed() {
      disconnectInterval.start()
      opts.onConnected?.()
    },
    onUnsubscribed() {
      opts.onDisconnected?.()
    }
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
