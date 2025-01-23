import {minCanvasWH} from '../../shared/theme.ts'
import {centerCam} from '../game.ts'
import type {Store} from '../store.ts'
import {Shmup} from './shmup.ts'

export class Title extends Phaser.Scene {
  #store: Store
  constructor(store: Store) {
    super(new.target.name)
    this.#store = store
  }

  create(): void {
    this.add.image(minCanvasWH.w / 2, minCanvasWH.h / 2, 'background')
    this.add.text(0, 0, 'title')

    const area = new Phaser.Geom.Rectangle(
      64,
      64,
      this.scale.width - 64,
      this.scale.height - 64
    )

    this.#addWasp(area, 'wasp--Idle')
    this.#addWasp(area, 'wasp--Idle')
    this.#addWasp(area, 'wasp--Idle')
    this.#addWasp(area, 'wasp--Idle')

    this.input.on('pointerdown', () => {
      this.scene.start(Shmup.name)
    })

    this.#store.setP1XY({x: 0, y: 0})
  }

  init(): void {
    centerCam(this)
  }

  #addWasp(area: Phaser.Geom.Rectangle, animation: 'wasp--Idle'): void {
    const start = area.getRandomPoint()

    const wasp = this.add.sprite(start.x, start.y, animation).play(animation)

    const durationX = Phaser.Math.Between(4000, 6000)
    const durationY = durationX + 3000

    this.tweens.add({
      targets: wasp,
      x: {
        getStart: () => wasp.x,
        getEnd: () => area.getRandomPoint().x,
        duration: durationX,
        ease: 'Linear'
      },
      y: {
        getStart: () => wasp.y,
        getEnd: () => area.getRandomPoint().y,
        duration: durationY,
        ease: 'Linear'
      },
      repeat: -1
    })
  }
}
