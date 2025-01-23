import type {EID} from '../../shared/types/eid.js'
import type {PeerUpdatedMessage} from '../../shared/types/message.js'
import type {SID} from '../../shared/types/sid.js'
import {centerCam} from '../game.js'
import {Bee} from '../objects/bee.js'
import type {Wasp} from '../objects/wasp.js'
import type {PlayerState, Store} from '../store.js'
import {GameOver} from './game-over.js'

export class Shmup extends Phaser.Scene {
  p1!: Bee
  readonly #peers: {[sid: SID]: Bee} = {}
  readonly #store: Store

  constructor(store: Store) {
    super(new.target.name)
    this.#store = store
  }

  create(): void {
    const cam = this.cameras.main

    // to-do: implement Aseprite tilemap loader or switch to another level
    //        editor. this is the officially recommended Phaser approach for
    //        converting an image to a tiled image but it easily causes an OOM.
    const levelBounds = this.textures.get('level').getFrameBounds()
    this.add.tileSprite(
      0,
      0,
      levelBounds.width * 10,
      levelBounds.height * 10,
      'level'
    )

    this.p1 = new Bee(this, this.#store, this.#store.p1)
    // to-do: position
    // this.bee.x = cam.width / 2 // - this.bee.width
    // this.bee.y = cam.height - this.bee.height / 2

    this.p1.start()

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

    for (const peer of Object.values(this.#store.peers))
      this.#onPeerConnected(peer)
    this.#store.on.peerConnected.add(this.#onPeerConnected)
    this.#store.on.peerDisconnected.add(this.#onPeerDisconnected)
    this.#store.on.peerUpdated.add(this.#onPeerUpdated)
  }

  destroy(): void {
    this.#store.on.peerConnected.delete(this.#onPeerConnected)
    this.#store.on.peerDisconnected.delete(this.#onPeerDisconnected)
    this.#store.on.peerUpdated.delete(this.#onPeerUpdated)
  }

  getBeeXY(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.p1.x, this.p1.y)
  }

  init(): void {
    centerCam(this)
  }

  override update(time: number, delta: number): void {
    super.update(time, delta)
    for (const wasp of this.#store.spawner.spawn(this, this.p1.y)) {
      this.physics.add.existing(wasp)
      this.physics.add.overlap(this.p1, wasp, (bee, wasp) =>
        this.#onBeeHitWasp(bee as Bee, wasp as Wasp)
      )
      wasp.start()
    }
  }

  // to-do: can this move to Bee?
  #onBeeHitWasp(bee: Bee, wasp: Wasp): void {
    if (bee.isAlive && wasp.alpha === 1) {
      this.p1.kill()
      wasp.stop()

      this.sound.stopAll()

      this.#store.spawner.killAll()
      this.destroy()
      this.scene.start(GameOver.name)
    }
  }

  #onPeerConnected = (state: Readonly<PlayerState>): void => {
    this.#peers[state.player.sid] = new Bee(this, this.#store, state)
    this.#store.setP1XY({
      x: this.#store.p1.xy.x,
      y: Math.min(this.#store.p1.xy.y, state.sync.xy.x)
    })
  }

  #onPeerDisconnected = (state: Readonly<PlayerState>): void => {
    this.#peers[state.player.sid]?.destroy()
    delete this.#peers[state.player.sid]
  }

  #onPeerUpdated = (msg: Readonly<PeerUpdatedMessage>): void => {
    const bee = this.#peers[msg.peer.sid]
    if (!bee) return
    bee.x = msg.sync.xy.x
    bee.y = msg.sync.xy.y
    this.p1.y = Math.min(this.p1.y, bee.y)
    for (const hit of Object.keys(msg.sync.hits)) {
      this.#store.spawner.kill(hit as EID)
    }
    // to-do: dir, tween.
  }
}
