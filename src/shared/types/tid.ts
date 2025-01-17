// hack: TIDs should be exported from @devvit/public-api.

/** Reddit user ID. */
export type T2 = `t2_${string}`
/** Reddit post ID. */
export type T3 = `t3_${string}`
/** subreddit ID. */
export type T5 = `t5_${string}`

export const noT2: T2 = 't2_0'
export const noT3: T3 = 't3_0'

export const noSnoovatarURL: string =
  'https://www.redditstatic.com/shreddit/assets/thinking-snoo.png'
export const noUsername: string = 'anonymous'

export function T2(t2: string): T2 {
  if (!t2.startsWith('t2_')) throw Error(`${t2} must start with t2_`)
  return t2 as T2
}

export function T3(t3: string): T3 {
  if (!t3.startsWith('t3_')) throw Error(`${t3} must start with t3_`)
  return t3 as T3
}
