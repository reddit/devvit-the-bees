import {realtimeVersion} from '../../shared/types/message.ts'
import type {Game} from '../game.ts'
import {postWebViewMessage} from '../mail.ts'

export class Bee extends Phaser.Physics.Arcade.Sprite {
  override body!: Phaser.Physics.Arcade.Body
  #game: Game
  #isAlive: boolean = false
  #speed: number = 100
  #target: Phaser.Math.Vector2

  constructor(scene: Phaser.Scene, x: number, y: number, game: Game) {
    super(scene, x, y, '')
    this.#game = game

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.#target = new Phaser.Math.Vector2()

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
    if (this.body.speed > 0 && this.#isAlive) {
      if (
        Phaser.Math.Distance.Between(
          this.x,
          this.y,
          this.#target.x,
          this.#target.y
        ) < 6
      ) {
        this.body.reset(this.#target.x, this.#target.y)
      }
    }

    if (this.#isAlive) {
      this.#target.x = this.scene.input.activePointer.x - (this.width * 5) / 8
      this.#target.y = this.scene.input.activePointer.y

      if (
        Phaser.Math.Distance.Between(
          this.x,
          this.y,
          this.#target.x,
          this.#target.y
        ) > 1
      ) {
        postWebViewMessage(this.#game, {
          type: 'Peer',
          peer: this.#game.p1,
          taps: [],
          version: realtimeVersion
        })
        const angle = this.scene.physics.moveToObject(
          this,
          this.#target,
          this.#speed
        )
        this.rotation = angle + Math.PI / 2
      }
    }
  }

  start(): void {
    this.#isAlive = true

    const radius = this.width / 4
    this.setCircle(radius, this.width / 4, this.height / 4)
    this.setCollideWorldBounds(true)
  }
}
