import type {WebViewMessage} from '../shared/types/message.ts'

export function devvitPostMessage(msg: WebViewMessage): void {
  parent.postMessage(msg, document.referrer || '*')
}
