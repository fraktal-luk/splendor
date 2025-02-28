
import {TokenState, statesUnique, moveFront, getCardPrice,
		CardState,  StateGroup,  Wave
} from './lib/searching.ts';


const startingTokState = new TokenState("000000", "444440");

const RUN_TOK_SEARCH = false;

if (RUN_TOK_SEARCH) {
	console.log("Token search");

	let front = [startingTokState];
	console.log(front);
	console.log(front.length);

	let allStates = front;

	for (let iter = 0; iter < 12+3; iter++) {
		front = moveFront(front);
		front.sort((a, b) => a.playerTokSum() - b.playerTokSum());
		//console.log(front);
			console.log(front.length);
			console.log(front[110]);
			
		allStates = statesUnique(allStates.concat(front));
	}

	console.log('num of unique: ' + allStates.length);

	allStates.sort((a, b) => a.playerTokSum() - b.playerTokSum());

	for (let c = 0; c <= 10; c++) {
		const subset = allStates.filter(s => s.playerTokSum() == c);
		console.log(`${c}: ${subset.length}`);
	}

	for (let c = 0; c <= 10; c++) {
		const subset = front.filter(s => s.playerTokSum() == c);
		console.log(`${c}: ${subset.length}`);
	}
}

let cs = new CardState();

console.log(cs.table);
cs.table.grab(10);
console.log(cs.table);



let stateGroup0 = new StateGroup();
let stateGroup0N = stateGroup0.copy();
stateGroup0N.tokState[0] = new TokenState("320110", "12433");
stateGroup0N.tokState[0] = new TokenState("222220", "22222");

// const buysG = stateGroup0N.nextStatesBuy();
// for (const bg of buysG) {
	// console.log(bg);
// }

// const takesG = stateGroup0N.nextStateGroupTake();
// console.log(takesG);

//console.log('\n\n\n\n');

const wave0 = //stateGroup0N.nextStates();
			   Wave.fromSG(stateGroup0);
//const anotherWave = wave.map(x => x.nextStates());


const wave1 = wave0.next_Repeating();
const wave2 = wave1.next_Repeating();
const wave3 = wave2.next_Repeating();

console.time('1');
const wave4 = wave3.next_Repeating();
const wave5 = wave4.next_Repeating();
const wave6 = wave5.next_Repeating();
const wave7 = wave6.next_Repeating();

console.timeEnd('1');
console.log('');


// console.log(`${wave0.groupSize()}, ${wave0.stateSize()}`);
// console.log(`${wave1.groupSize()}, ${wave1.stateSize()}`);
// console.log(`${wave2.groupSize()}, ${wave2.stateSize()}`);
// console.log(`${wave3.groupSize()}, ${wave3.stateSize()}`);
// console.log(`${wave4.groupSize()}, ${wave4.stateSize()}`);
// console.log(`${wave5.groupSize()}, ${wave5.stateSize()}`);


console.time('2');

const wave4u = wave3.next();
const wave5u = wave4u.next();
const wave6u = wave5u.next();
const wave7u = wave6u.next();

console.timeEnd('2');
console.log('');


 console.log(`${wave6.groupSize()}, ${wave6.stateSize()}`);
 console.log(`${wave6u.groupSize()}, ${wave6u.stateSize()}`);

 //console.log(`${wave7.groupSize()}, ${wave7.stateSize()}`);
 //console.log(`${wave7u.groupSize()}, ${wave7u.stateSize()}`);
