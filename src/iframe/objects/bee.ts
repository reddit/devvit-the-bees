import {realtimeVersion} from '../../shared/types/message.ts'
import type {Game} from '../game.ts'
import {postWebViewMessage} from '../mail.ts'

const speed: number = 20

export class Bee extends Phaser.Physics.Arcade.Sprite {
  override body!: Phaser.Physics.Arcade.Body
  #game: Game
  #isAlive: boolean = false
  #target: Phaser.Math.Vector2

  constructor(scene: Phaser.Scene, x: number, y: number, game: Game) {
    super(scene, x, y, '')
    this.#game = game

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.#target = new Phaser.Math.Vector2(x, y)

    this.play('bee--Idle')
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

    if (
      Phaser.Math.Distance.Between(
        this.x,
        this.y,
        this.#target.x,
        this.#target.y
      ) > 10 &&
      this.#isAlive &&
      pointer.isDown
    ) {
      this.scene.physics.moveToObject(this, this.#target, speed)
      postWebViewMessage(this.#game, {
        type: 'Peer',
        peer: this.#game.p1,
        taps: [],
        version: realtimeVersion
      })
    } else if (this.#isAlive && this.body.speed) this.body.reset(this.x, this.y)
  }

  start(): void {
    this.#isAlive = true

    const radius = this.width / 4
    this.setCircle(radius, this.width / 4, this.height / 4)
    this.setCollideWorldBounds(true)
  }
}
