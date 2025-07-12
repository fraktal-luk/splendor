
import {
		StateGroup,  Wave, // TMP_tokSubsets, //Wave_pruneCardStatesWave
} from './lib/searching.ts';

import {
	getCardPrice, TokenState, statesUnique, PlayerCardState, CardState, enoughStates,
} from './lib/searching_base.ts';

import {GameStates} from './lib/GameStates.ts'




let waveC = new GameStates.WavefrontC();
console.time('1');
for (let loopInd = 0; loopInd < 6; loopInd++) {
	waveC.move();
}
console.timeEnd('1');
