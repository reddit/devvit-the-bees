// hack: this costs us a lot. we shouldn't need unprocessed JSON, only a Phaser
//       config and we shouldn't need both a copy bundled in JS and another
//       downloaded from webroot/asset.
import atlas from '../../../webroot/assets/images/atlas.json'

import {minCanvasWH} from '../../shared/theme.ts'
import {devvitPostMessage} from '../mail.ts'
import {Title} from './title.ts'

export class Loading extends Phaser.Scene {
  constructor() {
    super(new.target.name)
  }

  create(): void {
    // hack: Phaser's importer doesn't read animation loop counts.
    for (const anim of this.anims.createFromAseprite('atlas')) {
      const tag = atlas.meta.frameTags.find(tag => tag.name === anim.key)!
      anim.repeat = 'repeat' in tag ? (tag.repeat as number) : -1
    }

    this.scene.start(Title.name)
    devvitPostMessage({type: 'Loaded'})
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
