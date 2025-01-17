import type {Context} from '@devvit/public-api'
import {SID} from '../../shared/types/sid.ts'
import {T2, T3, noT2, noT3} from '../../shared/types/tid.ts'
import {useState2} from './use-state2.ts'

export type ColorScheme = 'light' | 'dark'

// to-do: allow users to implement their own hooks so users don't have to ask
//        for context?

/** everything for a surface view that doesn't require a plugin call. */
export type Session = {
  /** whether "app" is in the devvitdebug query parameter. */
  debug: boolean
  // to-do: type colorScheme to ColorScheme; move under Context.ui.
  scheme: ColorScheme | undefined
  sid: SID
  t2: T2
  t3: T3 // to-do: possibly noT3? why?
  userAgent: UserAgent
}

export type UserAgent = {
  company: 'Reddit'
  client: 'Android' | 'iOS' | 'Shreddit'
  /** client version. eg, '2024.32.0+5262029.1875013'. */
  version: string // to-do: verify.
}

export function useSession(ctx: Readonly<Context>): Session {
  const [sid] = useState2<SID>(SID)
  const [company, client, version] =
    ctx.debug.metadata['devvit-user-agent']?.values[0]?.split(';') ?? [] // to-do: use Headers.
  return {
    debug: 'app' in ctx.debug, // to-do: add to Context.debug.app.
    scheme: ctx.uiEnvironment?.colorScheme as ColorScheme | undefined,
    sid, // to-do: add to Context?
    t2: T2(ctx.userId ?? noT2), // to-do: fix Context typing.
    t3: T3(ctx.postId ?? noT3), // to-do: fix Context typing.
    userAgent: {company, client, version} as UserAgent // to-do: add to Context.
  }
}
