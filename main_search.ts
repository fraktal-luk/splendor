
import {
		StateGroup,  Wave
} from './lib/searching.ts';

import {
	getCardPrice, TokenState, statesUnique, PlayerCardState, CardState,  
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
	//const wave8 = wave7.next_Repeating();

	console.timeEnd('1');
	console.log('');
}


console.time('2');

const wave4u = wave3.next();
const wave5u = wave4u.next();
const wave6u = wave5u.next();
const wave7u = wave6u.next();
//const wave8u = wave7u.next();

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


//TMP_cardSubsets(grouped);

function TMP_cardSubsets(stateMap: Map<number, StateGroup[]>): void {
	console.log(stateMap.keys().toArray());
	
	const setSizes = stateMap.keys().toArray();
	
	for (let i = 0; i < setSizes.length; i++) {
		if (i == 0) continue;
		
		// browse larger sets: [0:i)
		// Remember that empty card set is legit
		for (let j = 0; j < i; j++) {
			const subsetSize = setSizes[i];
			const supersetSize = setSizes[j];
			
			const subsetArr = stateMap.get(subsetSize)!;
			const supersetArr = stateMap.get(supersetSize)!;
			
			console.log(`${subsetSize} of ${supersetSize}`);
			
			TMP_arrSubsets(subsetArr, supersetArr);
		}
	}
}


function TMP_arrSubsets(subsets: StateGroup[], supersets: StateGroup[]): void {
	for (const sub of subsets) {
		for (const larger of supersets) {
			const included = TMP_cardsAreSubset(sub.cardState, larger.cardState);
			// CAREFUL: if matching, it doesn't mean that further search is not needed.
			// A match reduces some token states from subset but there may be token states in subset that are not in superset
			console.log(`${included}: [${sub.cardState.player.toStr()}](${sub.tokState.length}) in [${larger.cardState.player.toStr()}](${larger.tokState.length})`);
		}
	}
}


function TMP_cardsAreSubset(subset: CardState, superset: CardState): boolean {
	return TMP_bitmapIncluded(subset.player, superset.player);
}

function TMP_bitmapIncluded(subset: PlayerCardState, superset: PlayerCardState): boolean {
	for (let i = 0; i < subset.bitmap.length; i++)
		if (subset.bitmap[i] && !superset.bitmap[i]) return false;
	return true;
}


function TMP_tokSubsets(): void {
	
}