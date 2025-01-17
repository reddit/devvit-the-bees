import type {Seed} from './types/seed.ts'
import type {SID} from './types/sid.ts'
import {
  type T2,
  type T3,
  noSnoovatarURL,
  noT2,
  noUsername
} from './types/tid.ts'
import type {UTCMillis} from './types/time.ts'

export type PostSeed = {seed: Seed}

export type PostSave = {
  /** original poster. */
  author: T2
  /** post creation timestamp. */
  created: UTCMillis
  seed: PostSeed
  t3: T3
}

/** immutable R2 user data. */
export type Profile = {
  /** avatar image URL. to-do: does this change and require updating? */
  snoovatarURL: string
  /** player user ID. t2_0 for anons. */
  t2: T2
  /** player username. eg, spez. */
  username: string
}

export type Player = {profile: Profile; sid: SID}

export function PostSave(
  post: {readonly authorId: T2 | undefined; readonly createdAt: Date; id: T3},
  seed: Readonly<PostSeed>
): PostSave {
  if (!post.authorId) throw Error('no T2')
  return {
    author: post.authorId,
    created: post.createdAt.getUTCMilliseconds() as UTCMillis,
    seed,
    t3: post.id
  }
}

/**
 * don't use the original seed to generate the next since play is probably too
 * deterministic and may generate duplicate rocks.
 */
export function PostSeedFromNothing(): PostSeed {
  // assume positive 32b numbers are ok; ints in [1, 0x7fff_ffff].
  return {seed: (1 + Math.trunc(Math.random() * 0x7fff_ffff)) as Seed}
}

export function NoProfile(): Profile {
  return {snoovatarURL: noSnoovatarURL, t2: noT2, username: noUsername}
}
