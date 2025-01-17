import {minCanvasWH} from '../../shared/theme.ts'
import {devvitPostMessage} from '../mail.ts'
import {Title} from './title.ts'

export class Loading extends Phaser.Scene {
  constructor() {
    super(Loading.name)
  }

  create(): void {
    // to-do: the importer is not setting the repeat property. how to fix?
    console.log(this.anims.createFromAseprite('atlas'))
    this.anims.createFromAseprite('wasp')

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
    // to-do: is there a better to separate animations across different
    //        characters?
    this.load.aseprite('atlas', 'images/atlas.png', 'images/atlas.json')
    this.load.aseprite('wasp', 'images/wasp.png', 'images/wasp.json') // to-do: combine atlas.
  }
}
