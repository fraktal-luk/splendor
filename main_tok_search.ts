
import {TokenState, statesUnique, moveFront,} from './lib/searching.ts';

console.log("Token search");

const startingState = new TokenState("000000", "444440");

let front = [startingState];
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
