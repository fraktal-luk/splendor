
import {
		StateGroup,  Wave, // TMP_tokSubsets, //Wave_pruneCardStatesWave
} from './lib/searching.ts';

import {
	getCardPrice, TokenState, statesUnique, PlayerCardState, CardState, enoughStates,
} from './lib/searching_base.ts';

import {GameStates} from './lib/GameStates.ts'


let waveN = new GameStates.WavefrontC();


console.time('main');
for (let i = 0; i < 1 + 31 + 45 + 20 + 20 + 20 + 20  - 50 ; i++) {
	waveN.runStep();
}

console.timeEnd('main');

console.log(process.memoryUsage());

	waveN.showStats();

		//waveN.save();

	process.exit(0);

	console.log('\n\n\nTrace single');

console.time('ts');
console.timeEnd('ts');

