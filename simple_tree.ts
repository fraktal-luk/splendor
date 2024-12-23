
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



function iters1(times: number): void {
	let nBuys = 0;
	let nTakes = 0;

	let front = [tree.root.state];

	let iter = 0;
	
	while (iter++ <= times) {
		let totalLevelSize = 0;

		let strSet = new Set<string>();

		for (let i = 0; i < front.length; i++) {
			let s = front[i]!;

			const newTakes = s.findTakes();
			const newBuys = s.findBuys();

			nBuys += newBuys.length;
			nTakes += newTakes.length;

			totalLevelSize += (newTakes.length + newBuys.length);
			
			for (const e of newTakes)
				strSet.add(e.str());
			
			for (const e of newBuys)
				strSet.add(e.str());

		}

		const uniqueStrs = Array.from(strSet.values());
		
		const recreated = uniqueStrs.map(s => GameState1.fromStr(s));

		console.log('All ' + totalLevelSize + ", unique " + strSet.size);
		
		front = recreated;
	}

	console.log('\n');
	console.log(front.length);
	console.log(nTakes);
	console.log(nBuys);
}


function iters2(times: number): void {
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
			
			for (const e of newTakes)
				strSet.add(e.str());
			
			for (const e of newBuys)
				strSet.add(e.str());

		}		

		console.log('All ' + totalLevelSize + ", unique " + strSet.size);
		front = strSet;
	}

	console.log('\n');
	console.log(front.size);
	console.log(nTakes);
	console.log(nBuys);
}


const times = 6;


console.log('\n\n');

console.time('1');
iters2(times);
console.timeEnd('1');

console.log(process.memoryUsage());
