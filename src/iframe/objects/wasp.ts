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
    this.x -= 400
    this.y -= 300
    this.#path = new Phaser.Curves.Path(this.x, this.y)
      .lineTo(this.x, this.y)
      .circleTo(50 + Phaser.Math.RND.frac() * 25)
      .lineTo(this.x, this.y + 900)

    this.scene.tweens.add({
      targets: this.tween,
      t: 1,
      ease: 'Sine.easeInOut',
      duration: 12_000 + Phaser.Math.RND.frac() * 10_000,
      onComplete: () => {
        this.stop()
      }
    })

    const radius = this.width / 4
    this.setCircle(radius, this.width / 4, this.height / 4)
    this.body.enable = true

    this.#dead = false
    this.setInteractive()
    this.once(Phaser.Input.Events.POINTER_DOWN, () => {
      this.scene.sound.play('doot')
      this.play('wasp--Splat')
      this.once('animationcomplete-wasp--Splat', () => {
        this.setVisible(false)
        this.setActive(false)
      })
      this.#dead = true
      this.body.enable = false
    })
    this.scene.add.existing(this)
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
    }
  }

  override stop(): this {
    super.stop()

    this.body.stop()
    this.body.enable = false

    return this
  }
}
