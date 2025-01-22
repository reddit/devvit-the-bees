import type {WebViewMessage} from '../shared/types/message.ts'
import type {Store} from './store.ts'

export function postWebViewMessage(
  store: Readonly<Store>,
  msg: Readonly<WebViewMessage>
): void {
  if (msg.type === 'Peer') store.devPeerChan?.postMessage(msg)
  parent.postMessage(msg, document.referrer || '*')
}
