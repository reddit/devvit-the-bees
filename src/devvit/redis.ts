import type {JobContext, RedisClient} from '@devvit/public-api'
import {NoProfile, type PostSave, type Profile} from '../shared/save.ts'
import {type T2, type T3, noT2} from '../shared/types/tid.ts'
import {r2QueryProfile} from './r2.tsx'

/** Redis is 10000x faster than R2 or fetch. */

/** immutable Profile by user ID. */
const profileByT2Key: string = 'profile_by_t2'

/** immutable PostSave by post ID. */
const postSaveByT3Key: string = 'post_save_by_t3'

export async function redisQueryPostSave(
  redis: RedisClient,
  t3: T3
): Promise<PostSave | undefined> {
  const json = await redis.hGet(postSaveByT3Key, t3)
  if (json) return JSON.parse(json)
}

/** get or create profile. */
export async function redisQueryProfile(
  ctx: JobContext,
  t2: T2
): Promise<Profile> {
  if (t2 === noT2) return NoProfile()
  const json = await ctx.redis.hGet(profileByT2Key, t2)
  if (json) return JSON.parse(json)
  const profile = await r2QueryProfile(ctx.reddit, t2)
  await ctx.redis.hSet(profileByT2Key, {[t2]: JSON.stringify(profile)})
  return profile
}

export async function redisSetPostSave(
  redis: RedisClient,
  post: Readonly<PostSave>
): Promise<void> {
  await redis.hSet(postSaveByT3Key, {[post.t3]: JSON.stringify(post)}) // lookup.
}
