import type {Shmup} from '../scenes/shmup.ts'

export class Wasp extends Phaser.Physics.Arcade.Sprite {
  override body!: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody
  override scene!: Shmup
  #speed: number
  #lifespan: number = 0
  #isChasing: boolean = false
  #target: Phaser.Math.Vector2 = new Phaser.Math.Vector2()

  constructor(
    scene: Shmup,
    x: number,
    y: number,
    animation: string,
    speed: number
  ) {
    super(scene, x, y, animation)

    this.play('wasp--Idle')

    this.setScale(Phaser.Math.FloatBetween(0.5, 2))

    this.#speed = speed
  }

  start(): this {
    this.setCircle(14, 6, 2)

    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 2000,
      ease: 'Linear',
      hold: Phaser.Math.RND.between(3000, 8000),
      onComplete: () => {
        if (this.scene.player.isAlive) {
          this.#lifespan = Phaser.Math.RND.between(6000, 12000)
          this.#isChasing = true
        }
      }
    })

    return this
  }

  restart(x: number, y: number): this {
    this.body.reset(x, y)
    return this.setActive(true).setVisible(true).setAlpha(0).start()
  }

  protected override preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta)

    if (this.#isChasing) {
      this.#lifespan -= delta

      if (this.#lifespan <= 0) {
        this.#isChasing = false

        this.body.stop()

        this.scene.tweens.add({
          targets: this,
          alpha: 0,
          duration: 1000,
          ease: 'Linear',
          onComplete: () => {
            this.setActive(false)
            this.setVisible(false)
          }
        })
      } else {
        this.#target = this.scene.getPlayerXY()

        this.rotation =
          this.scene.physics.moveToObject(this, this.#target, this.#speed) +
          (3 * Math.PI) / 2
      }
    }
  }

  override stop(): this {
    super.stop()
    this.#isChasing = false

    this.body.stop()

    return this
  }
}
