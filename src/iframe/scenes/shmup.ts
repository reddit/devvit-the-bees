import {minCanvasWH} from '../../shared/theme.js'
import {type Game, centerCam} from '../game.js'
import {Bee} from '../objects/bee.js'
import {WaspGroup} from '../objects/wasp-group.js'
import type {Wasp} from '../objects/wasp.js'
import {GameOver} from './game-over.js'

export class Shmup extends Phaser.Scene {
  bee!: Bee
  #game: Game
  #wasps!: WaspGroup

  constructor(game: Game) {
    super(new.target.name)
    this.#game = game
  }

  create(): void {
    const cam = this.cameras.main
    this.add.image(minCanvasWH.w / 2, minCanvasWH.h / 2, 'background')

    this.#wasps = new WaspGroup(this.physics.world, this)
    this.bee = new Bee(this, 0, 0, this.#game, this.#game.p1.profile.username)
    this.bee.x = cam.width / 2 // - this.bee.width
    this.bee.y = cam.height - this.bee.height / 2

    this.bee.start()
    this.#wasps.start()

    this.physics.add.overlap(this.bee, this.#wasps, (bee, wasp) =>
      this.#onBeeHitWasp(bee as Bee, wasp as Wasp)
    )

    const bounds = {x: -1600, y: -900, w: 3200, h: 2400}
    this.physics.world.setBounds(bounds.x, bounds.y, bounds.w, bounds.h)
    cam.setBounds(bounds.x, bounds.y, bounds.w, bounds.h)
    cam.startFollow(
      this.bee,
      false,
      0.2,
      0.2,
      0,
      cam.height / 2 - (3 * this.bee.height) / 4
    )
  }

  getBeeXY(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.bee.x, this.bee.y)
  }

  init(): void {
    centerCam(this)
  }

  // to-do: can this move to Bee?
  #onBeeHitWasp(bee: Bee, wasp: Wasp): void {
    if (bee.isAlive && wasp.alpha === 1) {
      this.bee.kill()
      this.#wasps.stop()

      this.sound.stopAll()

      this.input.once('pointerdown', () => {
        this.scene.start(GameOver.name)
      })
    }
  }
}
