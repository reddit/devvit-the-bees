// hack: this costs us a lot. we shouldn't need unprocessed JSON, only a Phaser
//       config and we shouldn't need both a copy bundled in JS and another
//       downloaded from webroot/asset.
import atlas from '../../../webroot/assets/images/atlas.json'

import {minCanvasWH} from '../../shared/theme.ts'
import {centerCam} from '../game.ts'
import type {Store} from '../store.ts'
import {Title} from './title.ts'

export class Loading extends Phaser.Scene {
  #store: Store

  constructor(store: Store) {
    super(new.target.name)
    this.#store = store
  }

  create(): void {
    // hack: Phaser's importer doesn't read animation loop counts.
    for (const anim of this.anims.createFromAseprite('atlas')) {
      const tag = atlas.meta.frameTags.find(tag => tag.name === anim.key)
      if (!tag) throw Error(`no ${anim.key} tag`)
      anim.repeat = 'repeat' in tag ? Number.parseInt(tag.repeat) - 1 : -1
    }

    void this.#store.promise.then(() => this.scene.start(Title.name))
  }

  init(): void {
    centerCam(this)
  }

  preload(): void {
    // show loading screen.
    this.add.image(minCanvasWH.w / 2, minCanvasWH.h / 2, 'background')
    this.add.text(0, 0, 'loading')

    // load data.
    this.load.setPath('assets')
    this.load.audio('doot', 'sounds/doot.mp3')
    this.load.aseprite('atlas', 'images/atlas.png', 'images/atlas.json')
    this.load.image('level', 'images/level.png')
  }
}
