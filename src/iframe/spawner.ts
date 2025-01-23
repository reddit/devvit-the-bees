import type {EID} from '../shared/types/eid.ts'
import {utcMillisNow} from '../shared/types/time.ts'
import {Wasp} from './objects/wasp.ts'
import type {Shmup} from './scenes/shmup.ts'
import type {Store} from './store.ts'

type Wave = {y0: number; y1: number}

export class Spawner {
  #enemies: {[eid: EID]: Wasp} = {}
  #store: Store
  #waveIndex: number = -1
  #waves: Wave[] = []

  constructor(store: Store) {
    this.#store = store
    const rnd = new Phaser.Math.RandomDataGenerator([`${store.seed.seed}`])
    for (let i = 0, y = 0; i < 10; i++) {
      const hStart = 15 // to-do: extract.
      const hEnd = 165
      const h = rnd.integerInRange(hStart, hEnd)
      this.#waves.push({y0: y, y1: y + h})
      y += h
    }
  }

  spawn(scene: Shmup, y: number): Wasp[] {
    const waveIndex = this.#waves.findIndex(
      wave => Math.abs(y) % this.#waves[this.#waves.length - 1]!.y1 < wave.y1
    )!
    if (waveIndex === this.#waveIndex) return []
    this.#waveIndex = waveIndex
    const wave = this.#waves[waveIndex]!
    const rnd = new Phaser.Math.RandomDataGenerator([
      `${this.#store.seed.seed + wave.y0}`
    ])
    const worldXStart = 0
    const worldW = 1000 // to-do: pass me.
    const wStart = 100 // to-do: extract.
    const wEnd = 350
    const groupMin = 1
    const groupMax = 10
    const minSpeed = 10
    const maxSpeed = 20
    if (this.#store.debug)
      console.log(
        `spawning eid-${this.#store.seed.seed}-${waveIndex} at ${utcMillisNow()}`
      )
    const wasps = []
    for (
      let x = worldXStart;
      x < worldW;
      x += rnd.integerInRange(wStart, wEnd)
    ) {
      const total = rnd.integerInRange(groupMin, groupMax)
      for (let i = 0; i < total; i++) {
        const wasp = new Wasp(
          scene,
          x + rnd.integerInRange(5, 50),
          Math.sign(y) * wave.y1 - rnd.integerInRange(5, 50),
          rnd.integerInRange(minSpeed, maxSpeed)
        )
        wasps.push(wasp)
        this.#enemies[`eid-${this.#store.seed.seed}-${waveIndex}-${i}`] = wasp
      }
    }
    return wasps
  }
}
