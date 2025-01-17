import 'phaser' // Phaser typing assumes global.

import pkg from '../../package.json' with {type: 'json'}
import type {Player} from '../shared/save.js'
import {minCanvasWH} from '../shared/theme.js'
import type {DevvitSystemMessage} from '../shared/types/message.js'
import {GameOver} from './scenes/game-over.js'
import {Loading} from './scenes/loading.js'
import {Preload} from './scenes/preload.js'
import {Shmup} from './scenes/shmup.js'
import {Title} from './scenes/title.js'

console.log(`${pkg.name} v${pkg.version}`)

addEventListener('message', onMsg)
postMessage({type: 'Loaded'})

const config: Phaser.Types.Core.GameConfig = {
  backgroundColor: '#f00000', // to-do: fix.
  // height: '100%',
  width: minCanvasWH.w,
  height: minCanvasWH.h,
  pixelArt: true,
  physics: {default: 'arcade'},
  scale: {
    autoCenter: Phaser.Scale.CENTER_BOTH,
    mode: Phaser.Scale.EXPAND
    // zoom: Phaser.Scale.MAX_ZOOM
  },
  scene: [Preload, Loading, Title, Shmup, GameOver],
  type: Phaser.AUTO
  // width: '100%'
}

const game = new Phaser.Game(config)
game.scale.on('resize', onResize)

function onResize(
  gameSize: Phaser.Structs.Size,
  canvasSize: Phaser.Structs.Size,
  displaySize: Phaser.Structs.Size
): void {
  console.log(gameSize, canvasSize, displaySize)
  // const {width, height} = canvasSize
  // game.parent.setSize(width, height);
  // game.sizer.setSize(width, height);

  for (const scene of game.scene.getScenes()) {
    // scene.cameras.resize(innerWidth, innerHeight)
    for (const camera of scene.cameras.cameras) {
      console.log(camera)
      // If you want to preserve the letterboxed area only,
      // you might compute an "effective" size:
      //   const scaleX = width / this.baseWidth;
      //   const scaleY = height / this.baseHeight;
      //   const scale = Math.min(scaleX, scaleY);
      //   const effectiveWidth = this.baseWidth * scale;
      //   const effectiveHeight = this.baseHeight * scale;
      //   camera.setBounds(0, 0, effectiveWidth, effectiveHeight);
      //
      // Or if you want to fill the entire window as playable area:
      // camera.setBounds(0, 0, width, height)
    }
  }
}

// to-do: compile-time constant to enable dead code removal.
// to-do: spawn AI?
const noDevvit = location.port === '1234'

// to-do: move to a shared data object.
let debug = false
export let p1: Player

// to-do: move to mail?
async function onMsg(ev: MessageEvent<DevvitSystemMessage>): Promise<void> {
  // hack: filter unknown messages.
  if (ev.data.type !== 'devvit-message') return

  const msg = ev.data.data.message

  if (debug || (msg.type === 'Init' && msg.debug))
    console.log(`iframe received msg=${JSON.stringify(msg)}`)

  switch (msg.type) {
    case 'Init':
      debug = msg.debug
      p1 = msg.p1
      console.log(noDevvit, p1) // to-do: remove.
      break
    case 'Connected':
      break
    case 'Disconnected':
      break
    case 'Peer':
      break
    case 'PeerJoin':
      break
    case 'PeerLeave':
      break
    default:
      msg satisfies never
  }
}
