
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
//console.log(table.constStacks);


function iters1(times: number): void {
	let nBuys = 0;
	let nTakes = 0;

	let front = [tree.root];

	let iter = 0;

	while (iter++ <= times) {
		let newFrontS: GameState1[] = [];
		let frontSet = new Set<string>();

		let totalLevelSize = 0;

		for (let i = 0; i < front.length; i++) {
			let n = front[i]!;
			n.fillFollowers();

			const newFollowers = n.possibleBuy.concat(n.possibleTake);

			nBuys += n.possibleBuy.length;
			nTakes += n.possibleTake.length;

			totalLevelSize += newFollowers.length;
			newFrontS = newFrontS.concat(newFollowers);
		}

		const strs = newFrontS.map(x => x.str());
		const strSet = new Set<string>(strs);

		const uniqueStrs = Array.from(strSet.values());
		
		const recreated = uniqueStrs.map(s => GameNode1.fromState(GameState1.fromStr(s)));

		console.log('All ' + totalLevelSize + ", unique " + strSet.size);
		
		front = recreated;
		
		const playerPoints = front.map(x => x.state.player.points);
		console.log("<" + Math.min(...playerPoints) + ":" + Math.max(...playerPoints) + ">");
	}

	console.log('\n\n');
	console.log(front.length);
	console.log(nTakes);
	console.log(nBuys);
}


function iters2(times: number): void {
	let nBuys = 0;
	let nTakes = 0;

	let front = [tree.root.state];

	let iter = 0;
	
	while (iter++ <= times) {
		let newFrontS: GameState1[] = [];
		let frontSet = new Set<string>();

		let totalLevelSize = 0;

		let strSet = new Set<string>();

		for (let i = 0; i < front.length; i++) {
			let s = front[i]!;
			//n.fillFollowers();

			const newTakes = s.findTakes();
			const newBuys = s.findBuys();

			const newFollowers = newBuys.concat(newTakes);

			nBuys += newBuys.length;
			nTakes += newTakes.length;

			totalLevelSize += newFollowers.length;
			//newFrontS = newFrontS.concat(newFollowers);
			
			const newStrs = newFollowers.map(x => x.str());
			const newSet = new Set<string>(newStrs);
			strSet = strSet.union(newSet);
		}

		//const strs = newFrontS.map(x => x.str());
		//const strSet = new Set<string>(strs);

		const uniqueStrs = Array.from(strSet.values());
		
		const recreated = uniqueStrs.map(s => GameState1.fromStr(s));

		console.log('All ' + totalLevelSize + ", unique " + strSet.size);
		
		front = recreated;
		
		const playerPoints = front.map(x => x.player.points);
		console.log("<" + Math.min(...playerPoints) + ":" + Math.max(...playerPoints) + ">");
	}

	console.log('\n');
	console.log(front.length);
	console.log(nTakes);
	console.log(nBuys);
}


const times = 5;


console.log('\n\n');

console.time('1');
iters2(times);
console.timeEnd('1');

console.log(process.memoryUsage());
