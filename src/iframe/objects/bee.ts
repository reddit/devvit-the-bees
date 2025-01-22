import {fontFamily, fontMSize} from '../../shared/theme.ts'
import type {PlayerState, Store} from '../store.ts'

const speed: number = 20

export class Bee extends Phaser.Physics.Arcade.Sprite {
  override body!: Phaser.Physics.Arcade.Body
  #isAlive: boolean = false
  #state: PlayerState
  #store: Store
  #target: Phaser.Math.Vector2
  #text: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene, store: Store, state: Readonly<PlayerState>) {
    super(scene, state.xy.x, state.xy.y, '')
    this.#state = state
    this.#store = store

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.#target = new Phaser.Math.Vector2(state.xy.x, state.xy.y)
    this.#text = this.scene.add.text(
      this.x,
      this.y,
      state.player.profile.username,
      {
        fontFamily: fontFamily,
        fontSize: fontMSize
      }
    )

    this.play('bee--Idle')
  }

  override destroy(fromScene?: boolean): void {
    super.destroy(fromScene)
    this.#text.destroy(fromScene)
  }

  get isAlive(): boolean {
    return this.#isAlive
  }

  kill(): void {
    this.#isAlive = false
    this.body.stop()
  }

  protected override preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta)

    const pointer = this.scene.input.activePointer
    const xy = pointer.positionToCamera(
      this.scene.cameras.main
    ) as Phaser.Math.Vector2
    this.#target.x = xy.x
    this.#target.y = this.y

    // to-do: detect desktop, disable point movement, and enable wasd.
    if (
      Phaser.Math.Distance.Between(
        this.x,
        this.y,
        this.#target.x,
        this.#target.y
      ) >
        this.width / 2 &&
      this.#isAlive &&
      pointer.isDown
    )
      this.scene.physics.moveToObject(this, this.#target, speed)
    else if (this.#isAlive && this.body.speed) this.body.reset(this.x, this.y)

    this.#text.x = this.x - this.#text.width / 2
    this.#text.y = this.y + this.height / 2 - 4
    if (this.#store.p1.player.sid === this.#state.player.sid)
      this.#store.setP1XY({x: this.x, y: this.y})
  }

  start(): void {
    this.#isAlive = true

    const radius = this.width / 4
    this.setCircle(radius, this.width / 4, this.height / 4)
    this.setCollideWorldBounds(true)
  }
}
