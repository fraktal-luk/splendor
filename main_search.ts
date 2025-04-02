
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


const wave1 = wave0.next_Repeating();
const wave2 = wave1.next_Repeating();
const wave3 = wave2.next_Repeating();

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

const wave4u = wave3.next();
const wave5u = wave4u.next();
const wave6u = wave5u.next();
const wave7u = wave6u.next();
const wave8u = wave7u.next();

console.timeEnd('2');
console.log('');

if (RUN_REPEATS) {
	console.log(`${wave6.groupSize()}, ${wave6.stateSize()}`);
	console.log(`${wave6u.groupSize()}, ${wave6u.stateSize()}`);
}

const x = wave6u.stateGroups[7].cardState.player;
const y = wave6u.stateGroups[7].cardState.table;
const z = wave6u.stateGroups[7].tokStates_N;

console.log(wave7u.stateGroups.length);
console.log(wave7u.stateGroups.map(x => x.cardState.player.toStr()));

const grouped = Map.groupBy(wave7u.stateGroups, x => x.cardState.player.numOwned());


TMP_cardSubsets(grouped);
//TMP_tokSubsets(grouped.get(3)![0]!.tokState);
TMP_tokSubsets(grouped.get(2)![0]!.tokState);

