import type {WebViewMessage} from '../shared/types/message.ts'
import type {Game} from './game.ts'

export function postWebViewMessage(
  game: Readonly<Game>,
  msg: Readonly<WebViewMessage>
): void {
  if (msg.type === 'Peer') game.devPeerChan?.postMessage(msg)
  parent.postMessage(msg, document.referrer || '*')
}
