
import {TokenState, statesUnique, moveFront, getCardPrice,
		CardState,   FullState,  StateGroup,
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


const exampleTokState = new TokenState("201200", "243240");
console.log( exampleTokState.playerCanBuy("000000"));
console.log( exampleTokState.playerCanBuy("201200"));
console.log( exampleTokState.playerCanBuy("210200"));

console.log(cs.player.getBonuses());

cs.player.acquire(3);
console.log(cs.player.getBonuses());

// let state = new FullState();
// let stateN = state.copy();
// stateN.tokState = new TokenState("320110", "12433");
// stateN.tokState = new TokenState("222220", "22222");
// const buys = stateN.nextStatesBuy();
// console.log(buys);


let stateGroup0 = new StateGroup();
let stateGroup0N = stateGroup0.copy();
stateGroup0N.tokState[0] = new TokenState("320110", "12433");
stateGroup0N.tokState[0] = new TokenState("222220", "22222");

const buysG = stateGroup0N.nextStatesBuy();
for (const bg of buysG) {
	console.log(bg);
}

const takesG = stateGroup0N.nextStateGroupTake();
console.log(takesG);

console.log('\n\n\n\n');

// Let's change tok config
stateGroup0N.tokState[0] = new TokenState("323200", "12124");

const buysGn = stateGroup0N.nextStatesBuy();
for (const bg of buysGn) {
	console.log(bg);
}

const takesGn = stateGroup0N.nextStateGroupTake();
console.log(takesGn);