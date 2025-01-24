import type {WH} from './types/2d.ts'

export const paletteBlack: string = '#282828' // to-do: fix.
export const paletteWhite: string = '#f2f2f2' // to-do: fix.
export const spacePx: number = 8

export const minCanvasWH: Readonly<WH> = {w: 224, h: 320}

export const fontFamily: string = 'Times New Roman' // to-do: fix.
export const fontMSize: number = 12

export const playButtonWidth: number = 160 // to-do: fix.

export const thinStroke: number = 2 // to-do: fix.

export const scoreboardSize: number = 25

export const radius: number = spacePx // to-do: fix.

export const minButtonSize: number = 144 // to-do: fix.

export const uiScaleMax: number = 4 // to-do: fix.

export const peerDisconnectIntervalMillis: number = 1_000
export const peerDefaultDisconnectMillis: number = 5_000
export const peerMaxSyncInterval: number = 1_000
