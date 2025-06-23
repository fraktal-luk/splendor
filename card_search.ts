
import {
		StateGroup,  Wave, // TMP_tokSubsets, //Wave_pruneCardStatesWave
} from './lib/searching.ts';

import {
	getCardPrice, TokenState, statesUnique, PlayerCardState, CardState, enoughStates,
} from './lib/searching_base.ts';

import {GameStates} from './lib/GameStates.ts'




let waveC = new GameStates.Wavefront1();
for (let loopInd = 0; loopInd < 4; loopInd++) {
	waveC.move();
}

console.log(waveC.__cardStates.length);
