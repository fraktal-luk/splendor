
import {
		StateGroup,  Wave, // TMP_tokSubsets, //Wave_pruneCardStatesWave
} from './lib/searching.ts';

import {
	getCardPrice, TokenState, statesUnique, PlayerCardState, CardState, enoughStates,
} from './lib/searching_base.ts';

import {GameStates} from './lib/GameStates.ts'
import {Data} from './lib/DataStructures.ts'




let waveC = new GameStates.Wavefront1();
console.time('1');
for (let loopInd = 0; loopInd < 3; loopInd++) {
	waveC.move();
}
console.timeEnd('1');

let waveT = new GameStates.Wavefront0();
console.time('2');
for (let loopInd = 0; loopInd < 2; loopInd++) {
	waveT.move();
}
console.timeEnd('2');


const tts = new Data.TbTokState();
const pcs = new Data.PlCardState();

