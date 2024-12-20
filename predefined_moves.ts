
import {ValVector, satisfies, vecAdd, vecSub, vecEnough, vecSum} from './valvec.ts'

import {Color, CardId, Game, setupStacks, getCardPrice, getCardPoints, getCardColor,
		} from './rules.ts';

import { } from './comb.ts';

const presetOrder: number[] = [
   7, 23, 52, 12, 66, 52, 74, 79, 79, 43,  7, 74,
  38,  1, 30, 51, 60, 19, 47, 59, 29, 12, 22, 27,
   3, 41, 20, 11, 13, 31, 27, 42,  1, 32,  3, 42,
  45,  1, 47,  5, 22, 38,  8, 23, 22, 25, 38, 23,
   1, 33, 39, 17, 36, 29,  0, 33, 30,  8, 25,  8,
  27, 19, 21, 22, 23, 15, 17, 14,  8, 12,  0,  3,
   3, 12, 11,  6,  3,  8,  7,  5,  0,  7,  1,  1,
   5,  3,  3,  0,  0,  0
];


let game = new Game(3, true, presetOrder);
game.dontFill = true;

console.log(game.table.str());
console.log(game.players[0]);


function playMovesSinglePlayer(commands: string[]): void {
	for (const s of commands) {
		if (game.movePlayer(0, s)) {
			console.log("Move valid: " + s);
		}
		else {
			console.log("Move not valid: " + s);
		};
		
	}

	console.log(game.table.strSh());
	console.log('');
	console.log(game.players[0].strSh(0));
	game.sumUp();
}


const moves = [
	"t wgr",
    "t grw",
    "t brk",
	"b 12",
	"b 13",
	
	"t wbg",
	"t brk",
	"b 23",
	
	"twbk",
	"twbk",
	
	"b 22",
	
	"t 2g",
	"t wbg",
	"t bgr",
	"b 34",
	
	"t 2r",
	"t r",
	"t r",
	"b 21",
	
	"t 2r",
	"b 24"
];

playMovesSinglePlayer(moves);
