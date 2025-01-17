import {type JSONValue, useWebView} from '@devvit/public-api'

// to-do: templatize UseWebViewOptions and UseWebViewResult so we can't use the
//        wrong postMessage().
export type UseWebViewOptions2<
  From extends JSONValue = JSONValue,
  To extends JSONValue = JSONValue
> = {
  /** Relative HTML asset filename like `foo/bar.html`. Defaults to index.html if omitted. */
  url?: string
  /** Handle UI events originating from the web view to be handled by a Devvit app */
  onMessage: UseWebViewOnMessage2<From, To>
  /**
   * The callback to run when the web view has been unmounted. Might be used to
   * set state, stop or resume timers, or perform other tasks now that the web view is no longer visible.
   * @deprecated use the page visibility API for now.
   */
  onUnmount?: (hook: UseWebViewResult2<To>) => void | Promise<void>
}

export type UseWebViewResult2<To extends JSONValue = JSONValue> = {
  /** Send a message to the web view */
  postMessage(message: To): void
  /** Initiate a request for the web view to open */
  mount(): void
}

export type UseWebViewOnMessage2<
  From extends JSONValue = JSONValue,
  To extends JSONValue = JSONValue
> = (message: From, hook: UseWebViewResult2<To>) => void | Promise<void>

export function useWebView2<
  From extends JSONValue = JSONValue,
  To extends JSONValue = JSONValue
>(opts: UseWebViewOptions2<From, To>): UseWebViewResult2<To> {
  return useWebView<From>(opts)
}
