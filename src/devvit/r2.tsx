import {
  type Context,
  Devvit,
  type JobContext,
  type Post,
  type RedditAPIClient
} from '@devvit/public-api'
import {NoProfile, type PostSeed, type Profile} from '../shared/save.ts'
import {type T2, noSnoovatarURL, noT2, noUsername} from '../shared/types/tid.ts'
import {Preview} from './components/preview.tsx'

Devvit.configure({redditAPI: true})

/** create a new post as the viewer. */
export async function r2CreatePost(
  ctx: Context | JobContext,
  _seed: Readonly<PostSeed>, // to-do: fix me.
  username: string
): Promise<Post> {
  if (!ctx.subredditName) throw Error('no sub name')

  // requires special permission: post as viewer.
  const post = await ctx.reddit.submitPost({
    preview: <Preview />,
    subredditName: ctx.subredditName,
    title: '🐝 The Bees Order #0' // to-do: fix me.
  })

  console.log(`post by ${username}`)

  return post
}

export async function r2QueryProfile(
  r2: RedditAPIClient,
  t2: T2
): Promise<Profile> {
  if (t2 === noT2) return NoProfile()
  const user = await r2.getCurrentUser()
  // to-do: why can't this be propulated in User?
  const snoovatarURL = (await user?.getSnoovatarUrl()) ?? noSnoovatarURL
  const username = user?.username ?? noUsername
  return {snoovatarURL, t2, username}
}
