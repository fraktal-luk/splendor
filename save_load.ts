
import {
		StateGroup,  Wave, // TMP_tokSubsets, //Wave_pruneCardStatesWave
} from './lib/searching.ts';

import {
	getCardPrice, TokenState, statesUnique, PlayerCardState, CardState, enoughStates,
} from './lib/searching_base.ts';

import {GameStates} from './lib/GameStates.ts'


let waveN = new GameStates.WavefrontC();

waveN.load();

waveN.stats();


// for (let i = 0; i < 1 + 20 + -16 ; i++) {
// 	waveN.runStep();
// }

// waveN.save();
// waveN.load();

