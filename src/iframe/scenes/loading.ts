// hack: this costs us a lot. we shouldn't need unprocessed JSON, only a Phaser
//       config and we shouldn't need both a copy bundled in JS and another
//       downloaded from webroot/asset.
import atlas from '../../../webroot/assets/images/atlas.json'

import {minCanvasWH} from '../../shared/theme.ts'
import type {Game} from '../game.ts'
import {Title} from './title.ts'

export class Loading extends Phaser.Scene {
  #game: Game

  constructor(game: Game) {
    super(new.target.name)
    this.#game = game
  }

  create(): void {
    // hack: Phaser's importer doesn't read animation loop counts.
    for (const anim of this.anims.createFromAseprite('atlas')) {
      const tag = atlas.meta.frameTags.find(tag => tag.name === anim.key)
      if (!tag) throw Error(`no ${anim.key} tag`)
      anim.repeat = 'repeat' in tag ? (tag.repeat as number) : -1
    }

    void this.#game.init.then(() => this.scene.start(Title.name))
  }

  preload(): void {
    // show loading screen.
    this.add.image(minCanvasWH.w / 2, minCanvasWH.h / 2, 'background')
    this.add.text(0, 0, 'loading')

    // load data.
    this.load.setPath('assets')
    this.load.audio('doot', 'sounds/doot.mp3')
    this.load.aseprite('atlas', 'images/atlas.png', 'images/atlas.json')
  }
}
