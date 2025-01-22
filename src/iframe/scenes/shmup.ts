import {minCanvasWH} from '../../shared/theme.js'
import type {PeerMessage} from '../../shared/types/message.js'
import type {SID} from '../../shared/types/sid.js'
import {centerCam} from '../game.js'
import {Bee} from '../objects/bee.js'
import {WaspGroup} from '../objects/wasp-group.js'
import type {Wasp} from '../objects/wasp.js'
import type {PlayerState, Store} from '../store.js'
import {GameOver} from './game-over.js'

export class Shmup extends Phaser.Scene {
  p1!: Bee
  readonly #peers: {[sid: SID]: Bee} = {}
  readonly #store: Store
  #wasps!: WaspGroup

  constructor(store: Store) {
    super(new.target.name)
    this.#store = store
  }

  create(): void {
    const cam = this.cameras.main
    this.add.image(minCanvasWH.w / 2, minCanvasWH.h / 2, 'background')

    this.#wasps = new WaspGroup(this.physics.world, this)
    this.p1 = new Bee(this, this.#store, this.#store.p1)
    // to-do: position
    // this.bee.x = cam.width / 2 // - this.bee.width
    // this.bee.y = cam.height - this.bee.height / 2

    this.p1.start()
    this.#wasps.start()

    this.physics.add.overlap(this.p1, this.#wasps, (bee, wasp) =>
      this.#onBeeHitWasp(bee as Bee, wasp as Wasp)
    )

    const bounds = {x: -1600, y: -900, w: 3200, h: 2400}
    this.physics.world.setBounds(bounds.x, bounds.y, bounds.w, bounds.h)
    cam.setBounds(bounds.x, bounds.y, bounds.w, bounds.h)
    this.#store.p1.xy.x = 0
    this.#store.p1.xy.y = cam.height / 2 - (3 * this.p1.height) / 4
    cam.startFollow(
      this.p1,
      false,
      0.2,
      0.2,
      0,
      cam.height / 2 - (3 * this.p1.height) / 4
    )

    for (const peer of Object.values(this.#store.peers)) this.#onPeerJoin(peer)
    this.#store.subscribe.onPeerJoin.add(this.#onPeerJoin)
    this.#store.subscribe.onPeerLeave.add(this.#onPeerLeave)
    this.#store.subscribe.onPeerMessage.add(this.#onPeerMessage)
  }

  destroy(): void {
    this.#store.subscribe.onPeerJoin.delete(this.#onPeerJoin)
    this.#store.subscribe.onPeerLeave.delete(this.#onPeerLeave)
    this.#store.subscribe.onPeerMessage.delete(this.#onPeerMessage)
  }

  getBeeXY(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.p1.x, this.p1.y)
  }

  init(): void {
    centerCam(this)
  }

  // to-do: can this move to Bee?
  #onBeeHitWasp(bee: Bee, wasp: Wasp): void {
    if (bee.isAlive && wasp.alpha === 1) {
      this.p1.kill()
      this.#wasps.stop()

      this.sound.stopAll()

      this.input.once('pointerdown', () => {
        this.destroy()
        this.scene.start(GameOver.name)
      })
    }
  }

  #onPeerJoin = (state: Readonly<PlayerState>): void => {
    this.#peers[state.player.sid] = new Bee(this, this.#store, state)
  }

  #onPeerLeave = (state: Readonly<PlayerState>): void => {
    this.#peers[state.player.sid]?.destroy()
    delete this.#peers[state.player.sid]
  }

  #onPeerMessage = (msg: Readonly<PeerMessage>): void => {
    const bee = this.#peers[msg.peer.sid]
    if (!bee) return
    bee.x = msg.sync.xy.x
    bee.y = msg.sync.xy.y
    // to-do: dir, tween.
  }
}
