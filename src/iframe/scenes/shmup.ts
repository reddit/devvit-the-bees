import {minCanvasWH} from '../../shared/theme.js'
import type {Game} from '../game.js'
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
    this.add.image(minCanvasWH.w / 2, minCanvasWH.h / 2, 'background')

    this.#wasps = new WaspGroup(this.physics.world, this)
    this.bee = new Bee(this, 200, 200, this.#game)

    this.bee.start()
    this.#wasps.start()

    this.physics.add.overlap(this.bee, this.#wasps, (bee, wasp) =>
      this.onBeeHitWasp(bee as Bee, wasp as Wasp)
    )
  }

  // to-do: can this move to Bee?
  onBeeHitWasp(bee: Bee, wasp: Wasp): void {
    if (bee.isAlive && wasp.alpha === 1) {
      this.bee.kill()
      this.#wasps.stop()

      this.sound.stopAll()

      this.input.once('pointerdown', () => {
        this.scene.start(GameOver.name)
      })
    }
  }

  getPlayerXY(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.bee.x, this.bee.y)
  }
}
