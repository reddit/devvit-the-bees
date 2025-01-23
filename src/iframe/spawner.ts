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
  #index: number = 0

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

  kill(eid: EID): void {
    const wasp = this.#enemies[eid]
    if (!wasp) return
    delete this.#enemies[eid]
    wasp.kill()
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
    const groupMax = 50
    const xWiggleMin = 5
    const xWiggleMax = 50
    const yWiggleMin = 5
    const yWiggleMax = 50
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
        this.#index++
        const eid =
          `eid-${this.#store.seed.seed}-${waveIndex}-${this.#index}` as const
        const wasp = new Wasp(
          scene,
          x + rnd.integerInRange(xWiggleMin, xWiggleMax),
          Math.sign(y) * wave.y1 - rnd.integerInRange(yWiggleMin, yWiggleMax),
          rnd.realInRange(0.5, 1),
          rnd.frac() * 25,
          rnd.frac() * 10_000,
          this.#store,
          eid
        )
        wasps.push(wasp)
        this.#enemies[eid] = wasp
      }
    }
    return wasps
  }
}
