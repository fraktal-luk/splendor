
import {
		StateGroup,  Wave, // TMP_tokSubsets, //Wave_pruneCardStatesWave
} from './lib/searching.ts';

import {
	getCardPrice, TokenState, statesUnique, PlayerCardState, CardState, enoughStates,
} from './lib/searching_base.ts';

import {GameStates} from './lib/GameStates.ts'


let waveN = new GameStates.WavefrontC();


console.time('main');
for (let i = 0; i < 1 + 20 + 1    - 6; i++) {
	//waveN.runStep();
}

console.timeEnd('main');

//console.log(process.memoryUsage());

	//waveN.traceHot();

	//console.log('\nTrace precise\n');
	//waveN.traceGame(false);

	console.log('\n\n\nTrace single');

	 // console.log('\nTrace estimate\n');
	 // waveN.traceGame(true);
console.time('ts');
	waveN.traceSingle();
console.timeEnd('ts');

