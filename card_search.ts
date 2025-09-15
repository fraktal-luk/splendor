
import {
	getCardPrice, TokenState, statesUnique, PlayerCardState, CardState, enoughStates,
} from './lib/searching_base.ts';

import {GameStates} from './lib/GameStates.ts'



let waveC = new GameStates.WavefrontC();
console.time('1');
// for (let loopInd = 0; loopInd < 12 + 6 ; loopInd++) {
	// waveC.move();
// }

waveC.moveTimes(18);

console.log();

console.timeEnd('1');

console.log(process.memoryUsage());

waveC.sumUp();

waveC.moveTimes(2);
