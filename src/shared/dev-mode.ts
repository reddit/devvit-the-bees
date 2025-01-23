// to-do: compile-time constant to enable dead code removal.
/** development mode; no devvit. */
export const devMode: boolean = globalThis.location?.port === '1234'
