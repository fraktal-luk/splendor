
import {
		StateGroup,  Wave, // TMP_tokSubsets, //Wave_pruneCardStatesWave
} from './lib/searching.ts';

import {
	getCardPrice, TokenState, statesUnique, PlayerCardState, CardState, enoughStates,
		//ExampleNamespace
		GameStates
} from './lib/searching_base.ts';


const wave0 = Wave.fromSG(new StateGroup());

const wave1 = wave0.next();
const wave2 = wave1.next();
const wave3 = wave2.next();

console.time('2');


let waves = [wave0, wave1, wave2, wave3];
let newWave = wave3;

if (false)
{
	for (let iter = 4; iter < 10; iter++) {
		newWave = newWave.next();
		waves.push(newWave);
	}

	console.timeEnd('2');
	console.log('');


	const selectedWave = waves[9]!;

	console.log(selectedWave.groupSize());
	console.log(selectedWave.stateSize());
	console.log(selectedWave.stateGroups.map(sgStr).reverse().slice(0, 50));

}

function sgStr(sg: StateGroup): string {
	return sg.cardState.player.toStr() + '/(' + sg.tokState.length + ')'
}


let waveN = new GameStates.Wavefront0();

console.time('3');
for (let i = 0; i < 8+2 ; i++) {
	waveN.move();
	console.log('\n');
}

console.timeEnd('3');

//waveN.__tokStates.organize();
