
import {ValVector, satisfies, vecAdd, vecSub, vecEnough, vecSum,
		vecNonNegative, vecLimit0, str2vv, vv2str, vvLessThan} from './lib/valvec.ts'
import {Color, CardId, Game, setupStacks, getCardPrice, getCardPoints, getCardColor,
		} from './lib/rules.ts';

import {TableStruct1, TableState1, PlayerStruct1, PlayerState1, GameState1, GameNode1,
		MoveTree1, BuyMove1, TakeMove1, presetOrder, presetStacks} from './lib/simplified_rules.ts'


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


const times = 5;


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

if (setVar.size > 10000) {//throw new Error("Too big to write to file");
	console.log("Too big to write to file");
	process.exit(0);
}
//let writer = fs.createWriteStream("states.txt");

const states = [...setVar].map(s => GameState1.fromStr(s));
const sorted = states.sort(cmpStates1); // !! this sorting probably useless in this case

//let stateMap = new Map();

function makeStateStruct(sorted: GameState1[]): string[][][][] {
	let stateStruct: string[][][][] = [];

	for (const x of sorted) {
		const state = x;//GameState1.fromStr(x);

		const bonusSum = state.player.bonuses.reduce((a,b) => a+b);
		const tokenSum = state.player.tokens.reduce((a,b) => a+b);
		
		const index = [state.player.points, bonusSum, tokenSum];
		
		if (stateStruct[index[0]] == undefined) {
			stateStruct[index[0]] = [];
		}

		if (stateStruct[index[0]][index[1]] == undefined) {
			stateStruct[index[0]][index[1]] = [];
		}

		if (stateStruct[index[0]][index[1]][index[2]] == undefined) {
			stateStruct[index[0]][index[1]][index[2]] = [];
		}

		stateStruct[index[0]][index[1]][index[2]].push(state.player.str());
		
		//const str = "" + state.player.points + "; " + state.player.bonuses + " (" + bonusSum + "); " + state.player.tokens + " (" + tokenSum + ")\n";
		//writer.write(str);
	}
	
	return stateStruct;
}

const stateStruct = makeStateStruct(sorted);
//writer.end();

//console.log(stateStruct[0][0][5]);


function writeStructured(states: string[][][][], fname: string): void {
		
	const writer = fs.createWriteStream(fname);

	for (let i0 = 0; i0 < states.length; i0++) {
		if (states[i0] == undefined) continue;
		
		for (let i1 = 0; i1 < states[i0].length; i1++) {
			if (states[i0][i1] == undefined) continue;
			
			for (let i2 = 0; i2 < states[i0][i1].length; i2++) {
				if (states[i0][i1][i2] == undefined) continue;
				

	// for (const a0 of states) {
		
		// if (a0 == undefined) continue;
		// for (const a1 of a0) {
			
			// if (a1 == undefined) continue;
			// for (const a2 of a1) {
				// if (a2 == undefined) continue;
				
				// const player = PlayerState1.fromStr(a2[0]);
				// const bonusSum = player.bonuses.reduce((a,b) => a+b);
				// const tokenSum = player.tokens.reduce((a,b) => a+b);
				
				//const index = [];//[player.points, bonusSum, tokenSum];
							  
				
				const str = ">>>  " + i0 + "; " + i1 + "; " + i2 + "\n";
				writer.write(str);
				writer.write(states[i0][i1][i2].join('\n'));
				writer.write('\n');
			}
		}
	}

	writer.end();
}

writeStructured(stateStruct, "states_structured.txt");


function findTokenDom(str: string, others: string[][][][], bound: number[]): string | null {

	for (let i0 = others.length-1; i0 >= bound[0]!; i0--) {
		if (others[i0] == undefined) continue;
		
		for (let i1 = others[i0].length-1; i1 >= bound[1]!; i1--) {
			if (others[i0][i1] == undefined) continue;
			
			for (let i2 = others[i0][i1].length-1; i2 > bound[2]!; i2--) { // Here strictly greater is the condition! 
				if (others[i0][i1][i2] == undefined) continue;
				
				// Now compare to each element
				let thisList = others[i0][i1][i2];
				
				for (const s of thisList) {
					const checkedVec = str2vv(str.substr(0, 6));
					const refVec = str2vv(s.substr(0, 6));
					
					if (vvLessThan(checkedVec, refVec))
						return s;
				}
				
			}
		}
	}


	return null;
}


// Remove entries where num of tokens could be better (states exists which strictly dominate this in token number and aren't worse in other indicators)
function pruneStates(states: string[][][][]): string[][][][] {
	let nOk = 0;
	let nNok = 0;

	let res: string[][][][] = //[];
								states;
	
	for (let i0 = 0; i0 < states.length; i0++) {
		if (states[i0] == undefined) continue;
		
		for (let i1 = 0; i1 < states[i0].length; i1++) {
			if (states[i0][i1] == undefined) continue;
			
			for (let i2 = 0; i2 < states[i0][i1].length; i2++) {
				if (states[i0][i1][i2] == undefined) continue;
				
				// Scan all content and compare with more promising lists
				// Look in bins with [>=i0][>=i1][>i2]
				let thisList = states[i0][i1][i2];
				
				for (let si = 0; si < thisList.length; si++) {
					const found = findTokenDom(thisList[si], states, [i0, i1, i2]);
					
					if (found == null) {
						thisList[si] += " - OK";
						nOk++;
					}
					else {
						thisList[si] += " - < " + found
						nNok++;
					}
				}
				
			}
		}
		
	}
	
		console.log(`OK ${nOk}, NOK ${nNok}`);
	
	return res;
}

const prunedStruct = pruneStates(stateStruct);

writeStructured(prunedStruct, "states_pruned.txt");

