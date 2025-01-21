import type {Shmup} from '../scenes/shmup.ts'

export class Wasp extends Phaser.Physics.Arcade.Sprite {
  override body!: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody
  override scene!: Shmup
  tween: {t: number; vec: Phaser.Math.Vector2} = {
    t: 0,
    vec: new Phaser.Math.Vector2()
  }
  #speed: number
  #lifespan: number = 0
  #path!: Phaser.Curves.Path
  #dead: boolean = false

  constructor(scene: Shmup, x: number, y: number, speed: number) {
    super(scene, x, y, '')

    this.play('wasp--Idle')

    this.setScale(Phaser.Math.FloatBetween(0.5, 1))

    this.#speed = speed
  }

  start(): void {
    const cam = this.scene.cameras.main
    const x = Phaser.Math.RND.frac() * cam.width
    this.#path = new Phaser.Curves.Path(cam.x - this.width, 100)
      .lineTo(x, 100)
      .circleTo(50 + Phaser.Math.RND.frac() * 25)
      .lineTo(x, 900)

    this.scene.tweens.add({
      targets: this.tween,
      t: 1,
      ease: 'Sine.easeInOut',
      duration: 12_000 + Phaser.Math.RND.frac() * 4_000
    })

    const radius = this.width / 4
    this.setCircle(radius, this.width / 4, this.height / 4)
    this.body.enable = true

    // this.scene.tweens.add({
    //   targets: this,
    //   alpha: 1,
    //   duration: 2000,
    //   ease: 'Linear',
    //   hold: Phaser.Math.RND.between(3000, 8000),
    //   onComplete: () => {
    //     if (this.scene.bee.isAlive) {
    //       this.#lifespan = Phaser.Math.RND.between(6000, 12000)
    //     }
    //   }
    // })

    this.#dead = false
    this.setInteractive()
    this.once(Phaser.Input.Events.POINTER_DOWN, () => {
      this.scene.sound.play('doot')
      this.play('wasp--Squished')
      this.#dead = true
      this.stop()
    })
  }

  restart(x: number, y: number): void {
    this.body.reset(x, y)
    this.setActive(true).setVisible(true).setAlpha(0).start()
  }

  protected override preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta)

    if (this.#dead) return
    this.#lifespan -= delta

    this.#path.getPoint(this.tween.t, this.tween.vec)
    this.setPosition(this.tween.vec.x, this.tween.vec.y)

    if (this.#lifespan <= 0) {
      this.body.stop()

      // this.scene.tweens.add({
      //   targets: this,
      //   alpha: 0,
      //   duration: 1000,
      //   ease: 'Linear',
      //   onComplete: () => {
      //     this.setActive(false)
      //     this.setVisible(false)
      //   }
      // })
      // } else {
      //   this.#target = this.scene.getBeeXY()

      //   this.rotation =
      //     this.scene.physics.moveToObject(this, this.#target, this.#speed) +
      //     (3 * Math.PI) / 2
      // }
    }
  }

  override stop(): this {
    super.stop()

    this.body.stop()
    this.body.enable = false

    return this
  }
}
