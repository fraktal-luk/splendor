
import {
		StateGroup,  Wave,  TMP_tokSubsets, TMP_cardSubsets
} from './lib/searching.ts';

import {
	getCardPrice, TokenState, statesUnique, PlayerCardState, CardState, enoughStates
} from './lib/searching_base.ts';


let stateGroup0 = new StateGroup();
let stateGroup0N = stateGroup0.copy();
stateGroup0N.tokState[0] = new TokenState("320110", "12433");
stateGroup0N.tokState[0] = new TokenState("222220", "22222");


const wave0 = Wave.fromSG(stateGroup0);


const wave1 = wave0.next();
const wave2 = wave1.next();
const wave3 = wave2.next();

let wave6 = new Wave();

const RUN_REPEATS = false;
if (RUN_REPEATS) {
	console.time('1');
	const wave4 = wave3.next_Repeating();
	const wave5 = wave4.next_Repeating();
	wave6 = wave5.next_Repeating();
	const wave7 = wave6.next_Repeating();
	const wave8 = wave7.next_Repeating();

	console.timeEnd('1');
	console.log('');
}


console.time('2');


let waves = [wave0, wave1, wave2, wave3];
let newWave = wave3;

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

const grouped = Map.groupBy(selectedWave.stateGroups, x => x.cardState.player.numOwned());

let reducedWave = new Wave();
reducedWave.stateGroups = TMP_cardSubsets(grouped);

console.log(reducedWave.groupSize());
console.log(reducedWave.stateSize());
console.log(reducedWave.stateGroups.map(sgStr).reverse().slice(0, 50));

function sgStr(sg: StateGroup): string {
	return sg.cardState.player.toStr() + '/(' + sg.tokState.length + ')'
}
