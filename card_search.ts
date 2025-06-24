
import {
		StateGroup,  Wave, // TMP_tokSubsets, //Wave_pruneCardStatesWave
} from './lib/searching.ts';

import {
	getCardPrice, TokenState, statesUnique, PlayerCardState, CardState, enoughStates,
} from './lib/searching_base.ts';

import {GameStates} from './lib/GameStates.ts'




let waveC = new GameStates.Wavefront1();
console.time('1');
for (let loopInd = 0; loopInd < 6; loopInd++) {
	waveC.move();
}
console.timeEnd('1');


// const w0 = waveC.__cardStates[0]!;
// const w22 = waveC.__cardStates[22]!;

// console.log(w0);
// console.log(w0.keyString());
// console.log(GameStates.CardState.fromKeyString(w0.keyString()));


// console.log(w22);
// console.log(w22.keyString());
// console.log(GameStates.CardState.fromKeyString(w22.keyString()));
