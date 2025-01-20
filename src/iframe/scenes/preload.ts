import {centerCam} from '../game.ts'
import {Loading} from './loading.ts'

/**
 * load the assets needed to show a loading screen. almost all assets should be
 * loaded in LoadingScreen.
 */
export class Preload extends Phaser.Scene {
  constructor() {
    super(new.target.name)
  }

  create(): void {
    this.scene.start(Loading.name)
  }

  init(): void {
    centerCam(this)
    this.add.text(0, 0, 'preloading')
  }

  preload(): void {
    this.load.setPath('assets')
    this.load.image('background', 'images/background.png')
  }
}
