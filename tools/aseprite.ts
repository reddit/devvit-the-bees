/** https://github.com/aseprite/aseprite/blob/master/docs/ase-file-specs.md */
export type Aseprite = {meta: AsepriteMeta; frames: AsepriteFrameMap}

export type AsepriteFrameMap = {[key: AsepriteFrameTag | number]: object}

export type AsepriteMeta = {frameTags: AsepriteTagSpan[]}

/** `--tagname-format={filestem}--{animation}`. */
export type TagFormat = `${string}--${string}`

/** `--filename-format='{title}--{tag}--{frame}'`. */
export type AsepriteFrameTag = `${TagFormat}--${bigint}`

export type AsepriteTagSpan = {
  name: TagFormat | string
  from: number
  /** the inclusive ending index, possibly equal to from. */
  to: number
}
