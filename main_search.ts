
import {
		StateGroup,  Wave, // TMP_tokSubsets, //Wave_pruneCardStatesWave
} from './lib/searching.ts';

import {
	getCardPrice, TokenState, statesUnique, PlayerCardState, CardState, enoughStates,
} from './lib/searching_base.ts';

import {GameStates} from './lib/GameStates.ts'



let waveN = new GameStates.WavefrontT();


console.log("Run for initial state: " + GameStates.INITIAL_STATE.tokenState.niceString() + '\n');
// off to check state sorting
if (true) {
	console.time('1');
	for (let i = 0; i < 11 ; i++) {
		waveN.move();
		console.log('\n');
	}

	console.timeEnd('1');
}
