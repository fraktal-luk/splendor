
import {
	getCardPrice, TokenState, statesUnique, PlayerCardState, CardState, enoughStates,
} from './lib/searching_base.ts';

import {GameStates} from './lib/GameStates.ts'



let waveC = new GameStates.WavefrontC();

console.time('1');

waveC.moveTimes(18);

console.log();
console.timeEnd('1');


console.log(process.memoryUsage());

waveC.sumUp();

waveC.clearSoft();

console.time('warm');

waveC.moveTimes(18);

console.log();
console.timeEnd('warm');


	// waveC.moveTimes(2);
	// waveC.sumUp();


// Here, moves after 20 would crash
 // waveC.moveTimes(2);
 // waveC.sumUp();

 // waveC.moveTimes(2);
 // waveC.sumUp();