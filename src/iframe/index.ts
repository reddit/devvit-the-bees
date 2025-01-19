import 'phaser' // Phaser typing assumes global.

import pkg from '../../package.json' with {type: 'json'}
import {Game} from './game.js'

console.log(`${pkg.name} v${pkg.version}`)

const game = new Game()
game.start()
