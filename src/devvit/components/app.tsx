// biome-ignore lint/style/useImportType: Devvit is a functional dependency of JSX.
import {Devvit, useWebView} from '@devvit/public-api'
import {ChannelStatus} from '@devvit/public-api/types/realtime'
import {playButtonWidth} from '../../shared/theme.ts'
import {
  type DevvitMessage,
  type PeerUpdatedMessage,
  type WebViewMessage,
  realtimeVersion
} from '../../shared/types/message.ts'
import {useChannel2} from '../hooks/use-channel2.js'
import {useSession} from '../hooks/use-session.ts'
import {useState2} from '../hooks/use-state2.ts'
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

  const webView = useWebView<WebViewMessage, DevvitMessage>({
    onMessage(msg) {
      // if (session.debug)
      //   console.log(`${profile.username} App msg=${JSON.stringify(msg)}`)

      switch (msg.type) {
        case 'NewGame':
          // to-do: implement.
          break
        case 'PeerUpdated':
          if (chan.status !== ChannelStatus.Connected) break
          chan.send(msg)
          break
        case 'Registered':
          webView.postMessage({
            type: 'Init',
            debug: session.debug,
            p1,
            seed: postSave.seed
          })
          chan.subscribe() // to-do: verify platform unsubscribes hidden posts.
          break
        case 'Save':
          // to-do: implement.
          break
        default:
          msg satisfies never
      }
    }
  })
  const chan = useChannel2<PeerUpdatedMessage>({
    chan: session.t3,
    onPeerMessage: msg => webView.postMessage(msg),
    p1,
    version: realtimeVersion,
    onPeerConnected: msg =>
      webView.postMessage({...msg, type: 'PeerConnected'}),
    onPeerDisconnected: peer =>
      webView.postMessage({peer, type: 'PeerDisconnected'}),
    onConnected: () => webView.postMessage({type: 'Connected'}),
    onDisconnected: () => webView.postMessage({type: 'Disconnected'})
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
