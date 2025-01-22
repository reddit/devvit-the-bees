// biome-ignore lint/style/useImportType: Devvit is a functional dependency of JSX.
import {Devvit} from '@devvit/public-api'
import {ChannelStatus} from '@devvit/public-api/types/realtime'
import {playButtonWidth} from '../../shared/theme.ts'
import {
  type DevvitMessage,
  type PeerMessage,
  type WebViewMessage,
  realtimeVersion
} from '../../shared/types/message.ts'
import {useChannel2} from '../hooks/use-channel2.js'
import {useSession} from '../hooks/use-session.ts'
import {useState2} from '../hooks/use-state2.ts'
import {useWebView2} from '../hooks/use-web-view2.ts'
import {redisQueryPostSave, redisQueryProfile} from '../redis.ts'
import {Title} from './title.tsx'

export function App(ctx: Devvit.Context): JSX.Element {
  const session = useSession(ctx)
  const [profile] = useState2(() => redisQueryProfile(ctx, session.t2))
  const p1 = {profile, sid: session.sid}
  const [postSave] = useState2(async () => {
    const postSave = await redisQueryPostSave(ctx.redis, session.t3)
    if (!postSave) throw Error(`no post save for ${session.t3}`)
    return postSave
  })

  const webView = useWebView2<WebViewMessage, DevvitMessage>({
    onMessage(msg) {
      // if (session.debug)
      //   console.log(`${profile.username} App msg=${JSON.stringify(msg)}`)

      switch (msg.type) {
        case 'Listening':
          webView.postMessage({
            type: 'Init',
            debug: session.debug,
            p1,
            seed: postSave.seed
          })
          chan.subscribe() // to-do: verify platform unsubscribes hidden posts.
          break
        case 'NewGame':
          // to-do: implement.
          break
        case 'Save':
          // to-do: implement.
          break
        case 'Peer':
          if (chan.status !== ChannelStatus.Connected) break
          chan.send(msg)
          break
        default:
          msg satisfies never
      }
    }
  })
  const chan = useChannel2<PeerMessage>({
    chan: session.t3,
    onMessage: msg => webView.postMessage(msg),
    p1,
    version: realtimeVersion,
    onPeerJoin: peer => webView.postMessage({peer: peer, type: 'PeerJoin'}),
    onPeerLeave: peer => webView.postMessage({peer: peer, type: 'PeerLeave'}),
    onSubscribed: () => webView.postMessage({type: 'Connected'}),
    onUnsubscribed: () => webView.postMessage({type: 'Disconnected'})
  })

  return (
    <Title>
      <text>
        {chan.status === ChannelStatus.Connected
          ? `${Object.keys(chan.peers).length} online`
          : 'offline'}
      </text>
      {/* biome-ignore lint/a11y/useButtonType: */}
      <button
        appearance='secondary'
        size='large'
        minWidth={`${playButtonWidth}px`}
        icon='play-outline'
        onPress={webView.mount}
      >
        play / new game / watch
      </button>
    </Title>
  )
}
