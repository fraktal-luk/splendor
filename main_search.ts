
import {
		StateGroup,  Wave, // TMP_tokSubsets, //Wave_pruneCardStatesWave
} from './lib/searching.ts';

import {
	getCardPrice, TokenState, statesUnique, PlayerCardState, CardState, enoughStates,
} from './lib/searching_base.ts';

import {GameStates} from './lib/GameStates.ts'


let waveN = new GameStates.WavefrontC();


console.time('main');
for (let i = 0; i < 1 + 20 + -10 + 2 ; i++) {
	waveN.runStep();
}

console.timeEnd('main');

console.log(process.memoryUsage());

	
	waveN.save();


	//waveN.traceGame(false);

	process.exit(0);




	console.log('\n\n\nTrace single');

console.time('ts');
	waveN.traceSingle();
console.timeEnd('ts');

