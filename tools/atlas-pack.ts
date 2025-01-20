#!/usr/bin/env -S node --experimental-strip-types --no-warnings=ExperimentalWarning

import {type ExecFileException, execFile} from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import type {Aseprite, AsepriteFrameTag} from './aseprite.ts'

const atlasDir = 'resources/atlas'
const atlasFilenames = fs
  .readdirSync(atlasDir)
  .filter(name => name.endsWith('.aseprite'))
  .map(name => path.resolve(atlasDir, name))
const atlasImageFilename = 'webroot/assets/images/atlas.png'
const atlasJSONFilename = 'webroot/assets/images/atlas.json'

// per Phaser guidance, border / padding > 0.
const json = await ase(
  '--batch',
  '--border-padding=1',
  '--filename-format={title}--{tag}--{frame}',
  '--ignore-empty',
  '--inner-padding=1',
  '--list-slices',
  '--list-tags',
  '--merge-duplicates',
  '--shape-padding=1',
  `--sheet=${atlasImageFilename}`,
  '--sheet-pack',
  '--tagname-format={title}--{tag}',
  '--trim',
  ...atlasFilenames
)

// hack: Phaser's Aseprite importer doesn't seem to support multiple file
//       inputs; --filename-format={frame} is required but that can't make
//       unique frame numbers across files. rewrite {title}--{tag}--{frame} to
//       unique indices.
const atlas: Aseprite = JSON.parse(json)
let frameNum = 0
for (const span of atlas.meta.frameTags) {
  for (let i = span.from; i <= span.to; i++) {
    const frameTag = `${span.name}--${i}` as AsepriteFrameTag
    const frame = atlas.frames[frameTag]!
    delete atlas.frames[frameTag]
    atlas.frames[frameNum] = frame
    frameNum++
  }
  span.from = frameNum - (span.to - span.from + 1)
  span.to = frameNum - 1
}
fs.writeFileSync(atlasJSONFilename, JSON.stringify(atlas, undefined, 2))

async function ase(...args: readonly string[]): Promise<string> {
  const [err, stdout, stderr] = await new Promise<
    [ExecFileException | null, string, string]
  >(resolve =>
    execFile('aseprite', args, (err, stdout, stderr) =>
      resolve([err, stdout, stderr])
    )
  )
  process.stderr.write(stderr)
  if (err) throw err
  return stdout
}
