declare const seed: unique symbol
/** random seed. */
export type Seed = number & {readonly [seed]: never}
