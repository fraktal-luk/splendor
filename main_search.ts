
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

// off to check state sorting
if (false) {
	console.time('3');
	for (let i = 0; i < 8+2 ; i++) {
		waveN.move();
		console.log('\n');
	}

	console.timeEnd('3');
}

//waveN.__tokStates.organize();

const vecs = GameStates.genVectors(4);
//GameStates.showVecs(vecs);

function groupBySums(vecs: GameStates.TokenVec[]): Map<number, GameStates.TokenVec[]> {
	return Map.groupBy(vecs, x => x.sum());
}

const grouped = groupBySums(vecs);// Map.groupBy(vecs, x => x.sum());

console.log(vecs.length);
grouped.forEach((arr, sum, map) => console.log(`${sum}: ${arr.length}`));

console.log((vecs[5]!));
console.log(GameStates.vec2bin(vecs[5]!));

console.log((vecs[105]!));
console.log(GameStates.vec2bin(vecs[105]!));

const binned = Map.groupBy(vecs, v => GameStates.vec2bin(v).str);

//console.log(binned);

//binned.forEach((arr, str, map) => console.log(`${str} (${(new GameStates.TokenVec(str)).sum()}): ${arr.length}`));

const groupedBins = groupBySums(binned.keys().toArray().map(s => new GameStates.TokenVec(s)));
console.log(binned.size);
groupedBins.forEach((arr, sum, map) => console.log(`${sum}: ${arr.length}`));
