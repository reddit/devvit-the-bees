import {minCanvasWH} from '../../shared/theme.js'
import {Bee} from '../objects/bee.js'
import {WaspGroup} from '../objects/wasp-group.js'
import type {Wasp} from '../objects/wasp.js'
import {GameOver} from './game-over.js'

export class Shmup extends Phaser.Scene {
  player!: Bee
  #wasps!: WaspGroup

  constructor() {
    super(new.target.name)
  }

  create(): void {
    this.add.image(minCanvasWH.w / 2, minCanvasWH.h / 2, 'background')

    this.#wasps = new WaspGroup(this.physics.world, this)
    this.player = new Bee(this, 200, 200)

    this.player.start()
    this.#wasps.start()

    this.physics.add.overlap(this.player, this.#wasps, (player, wasp) =>
      this.onPlayerHitWasp(player as Bee, wasp as Wasp)
    )
  }

  // to-do: can this move to Bee?
  onPlayerHitWasp(player: Bee, wasp: Wasp): void {
    if (player.isAlive && wasp.alpha === 1) {
      this.player.kill()
      this.#wasps.stop()

      this.sound.stopAll()

      this.input.once('pointerdown', () => {
        this.scene.start(GameOver.name)
      })
    }
  }

  getPlayerXY(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.player.x, this.player.y)
  }
}
