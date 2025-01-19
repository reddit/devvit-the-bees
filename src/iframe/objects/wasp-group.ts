import type {Shmup} from '../scenes/shmup.js'
import {Wasp} from './wasp.js'

export class WaspGroup extends Phaser.Physics.Arcade.Group {
  override scene!: Shmup
  #waspAnimConfig: {readonly speed: number}[] = [
    {speed: 60},
    {speed: 90},
    {speed: 120},
    {speed: 180}
  ]
  #timedEvent!: Phaser.Time.TimerEvent

  constructor(world: Phaser.Physics.Arcade.World, scene: Shmup) {
    super(world, scene)
    this.classType = Wasp
  }

  start(): void {
    const wasp1 = new Wasp(this.scene, 100, 100, 0)
    const wasp2 = new Wasp(this.scene, 700, 600, 0)
    const wasp3 = new Wasp(this.scene, 200, 400, 0)

    this.add(wasp1, true)
    this.add(wasp2, true)
    this.add(wasp3, true)

    wasp1.start()
    wasp2.start()
    wasp3.start()

    this.#timedEvent = this.scene.time.addEvent({
      delay: 2000,
      callback: this.spawnWasp,
      callbackScope: this,
      loop: true
    })
  }

  stop(): void {
    this.#timedEvent.remove()

    for (const child of this.getChildren() as Wasp[]) child.stop()
  }

  spawnWasp(): void {
    const x = Phaser.Math.RND.between(0, 800)
    const y = Phaser.Math.RND.between(0, 600)

    const config = Phaser.Math.RND.pick(this.#waspAnimConfig)

    let wasp = this.getChildren().find(child => !child.active) as
      | Wasp
      | undefined

    if (wasp) wasp.restart(x, y)
    else {
      wasp = new Wasp(this.scene, x, y, config.speed)

      this.add(wasp, true)

      wasp.start()
    }
  }
}
