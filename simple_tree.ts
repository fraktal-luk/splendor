
import {ValVector, satisfies, vecAdd, vecSub, vecEnough, vecSum,
		vecNonNegative, vecLimit0, str2vv, vv2str	} from './valvec.ts'
import {Color, CardId, Game, setupStacks, getCardPrice, getCardPoints, getCardColor,
		} from './rules.ts';

import {TableStruct1, TableState1, PlayerStruct1, PlayerState1, GameState1, GameNode1,
		MoveTree1, BuyMove1, TakeMove1, presetOrder, presetStacks} from './simplified_rules.ts'


let tree = new MoveTree1();
tree.root.state.table.init(presetStacks);

const table = tree.root.state.table;

console.log(table.rows);

let setVar = new Set<string>();

function iters1(times: number): void {
	let nBuys = 0;
	let nTakes = 0;

	let front = new Set<string>([tree.root.state.str()]);

	let iter = 0;
	
	while (iter++ <= times) {
		let totalLevelSize = 0;

		let strSet = new Set<string>();

		for (const ss of front) {
			let s = GameState1.fromStr(ss);
			const newTakes = s.findTakes();
			const newBuys = s.findBuys();

			nBuys += newBuys.length;
			nTakes += newTakes.length;
			totalLevelSize += (newTakes.length + newBuys.length);
			
			for (const e of newTakes) strSet.add(e.str());
			for (const e of newBuys) strSet.add(e.str());
		}		

		console.log('All ' + totalLevelSize + ", unique " + strSet.size);
		front = strSet;
	}

	setVar = front;

	console.log('\n' + front.size + ";; " + nTakes + "; " + nBuys);
}


const times = 2;


console.log('\n\n');

console.time('1');
iters1(times);
console.timeEnd('1');

console.log(process.memoryUsage());


function cmpStates1(a: GameState1, b: GameState1): number {
	// First by points
	const pointDiff = b.player.points - a.player.points;
	if (pointDiff != 0) return pointDiff;
	
	// Compare bonuses
	const bonusDiff = vecSum(vecSub(b.player.bonuses, a.player.bonuses));
	if (bonusDiff != 0) return bonusDiff;

	// Compare bonuses
	const tokenDiff = vecSum(vecSub(b.player.tokens, a.player.tokens));
	if (tokenDiff != 0) return tokenDiff;

	return 0;
}



const fs = require("fs");

if (setVar.size > 2000) {//throw new Error("Too big to write to file");
	console.log("Too big to write to file");
	process.exit(0);
}
let writer = fs.createWriteStream("states.txt");

const states = [...setVar].map(s => GameState1.fromStr(s));
const sorted = states.sort(cmpStates1);

for (const x of sorted) {
	const state = x;//GameState1.fromStr(x);
					
	const bonusSum = state.player.bonuses.reduce((a,b) => a+b);
	const tokenSum = state.player.tokens.reduce((a,b) => a+b);
	const str = "" + state.player.points + "; " + state.player.bonuses + " (" + bonusSum + "); " + state.player.tokens + " (" + tokenSum + ")\n";
	writer.write(str);
}
writer.end();
