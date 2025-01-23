import type {Seed} from './seed.ts'

/** entity identity (seed, wave number, spawn). */
export type EID = `eid-${Seed}-${number}-${number}`
