
import {
		StateGroup,  Wave, // TMP_tokSubsets, //Wave_pruneCardStatesWave
} from './lib/searching.ts';

import {
	getCardPrice, TokenState, statesUnique, PlayerCardState, CardState, enoughStates,
} from './lib/searching_base.ts';

import {GameStates} from './lib/GameStates.ts'


let waveN = new GameStates.WavefrontC();


console.time('total');
for (let i = 0; i < 1 + 20 + 1    - 6; i++) {
	waveN.runStep();
}

console.timeEnd('total');

console.log(process.memoryUsage());

	waveN.analyzeLatest();


	console.log('\nTrace precise\n');
	waveN.traceGame(false);

	 // console.log('\nTrace estimate\n');
	 // waveN.traceGame(true);

