import type {EID} from '../../shared/types/eid.ts'
import type {Shmup} from '../scenes/shmup.ts'
import type {Store} from '../store.ts'

export class Wasp extends Phaser.Physics.Arcade.Sprite {
  override body!: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody
  override scene!: Shmup
  tween: {t: number; vec: Phaser.Math.Vector2} = {
    t: 0,
    vec: new Phaser.Math.Vector2()
  }
  #lifespan: number = 0
  #path!: Phaser.Curves.Path
  #dead: boolean = false
  #circleWiggle: number
  #durationWiggle: number
  #store: Store
  #eid: EID
  // #text: Phaser.GameObjects.Text
  #tween!: Phaser.Tweens.Tween

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    scale: number,
    circleWiggle: number,
    durationWiggle: number,
    store: Store,
    eid: EID
  ) {
    super(scene, x, y, '')
    this.#store = store
    this.#eid = eid

    this.play('wasp--Idle')

    this.setScale(scale)

    this.#circleWiggle = circleWiggle
    this.#durationWiggle = durationWiggle

    // this.#text = this.scene.add.text(x + 10, y + 10, eid)
  }

  start(): void {
    this.x -= 400
    this.y -= 300
    this.#path = new Phaser.Curves.Path(this.x, this.y)
      .lineTo(this.x, this.y)
      .circleTo(50 + this.#circleWiggle)
      .lineTo(this.x, this.y + 900)

    this.#tween = this.scene.tweens.add({
      targets: this.tween,
      t: 1,
      ease: 'Sine.easeInOut',
      duration: 30_000 + this.#durationWiggle,
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
      this.kill()
      this.#store.p1.sync.hits[this.#eid] ??= 0
      this.#store.p1.sync.hits[this.#eid]!++
    })
    this.scene.add.existing(this)
  }

  kill(): void {
    this.#tween.destroy()
    this.scene.sound.play('doot')
    this.once('animationcomplete-wasp--Splat', () => {
      this.setVisible(false)
      this.setActive(false)
      this.destroy()
      console.log('dead')
    })
    this.play('wasp--Splat')
    this.#dead = true
    this.body.enable = false
  }

  protected override preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta)

    if (this.#dead) return
    this.#lifespan -= delta

    this.#path.getPoint(this.tween.t, this.tween.vec)
    this.x = this.tween.vec.x
    this.y = this.tween.vec.y
    this.setPosition(this.tween.vec.x, this.tween.vec.y)

    if (this.#lifespan <= 0) {
      this.body.stop()
    }

    // this.#text.x = this.x + 10
    // this.#text.y = this.y + 10
  }

  override stop(): this {
    super.stop()

    this.body.stop()
    this.body.enable = false

    return this
  }
}
