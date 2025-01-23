import {V4} from './v4.ts'

/** session / screen identity. reset on app (re)load. */
export type SID = `sid-${V4}`

export function SID(): SID {
  return `sid-${V4()}`
}
