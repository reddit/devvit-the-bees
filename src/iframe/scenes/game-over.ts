import {Title} from './title.ts'

export class GameOver extends Phaser.Scene {
  constructor() {
    super(new.target.name)
  }

  create(): void {
    this.add.text(0, 0, 'game over')
    this.input.on('pointerdown', () => this.scene.start(Title.name))
  }
}
