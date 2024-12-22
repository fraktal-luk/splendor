
import {ValVector, satisfies, vecAdd, vecSub, vecEnough, vecSum,
		vecNonNegative, vecLimit0, str2vv, vv2str	} from './valvec.ts'
import {Color, CardId, Game, setupStacks, getCardPrice, getCardPoints, getCardColor,
		} from './rules.ts';

import {TableStruct1, TableState1, PlayerStruct1, PlayerState1, GameState1, GameNode1,
		MoveTree1, BuyMove1, TakeMove1, presetOrder} from './simplified_rules.ts'


let tree = new MoveTree1();
tree.root.state.table.init(presetOrder);

const table = tree.root.state.table;

console.log(table.rows);
console.log(table.constStacks);


let iter = 0;

let front = [tree.root];

console.log(front);
console.time('1');

while (iter++ <= 5 - 2) {
	let newFrontS: GameState1[] = [];
	let frontSet = new Set();
	
	for (let i = 0; i < front.length; i++) {
		let n = front[i]!;
		n.fillFollowers();
		
		const newFollowers = n.possibleBuy.concat(n.possibleTake);
		
		newFrontS = newFrontS.concat(newFollowers);
		
		const strings = newFollowers.map(x => x.str);
		const newSet = new Set(strings);
		frontSet = frontSet.union(newSet);
	}

	const strs = newFrontS.map(x => x.str());

	const strSet = new Set(strs);

	const uniqueStrs = Array.from(strSet.values());
	
	const recreated = uniqueStrs.map(s => GameNode1.fromState(GameState1.fromStr(s)));

	console.log('All ' + front.length + ", unique " + strSet.size + ", frontSet " + frontSet.size);
	
	front = recreated;
	
	const playerPoints = front.map(x => x.state.player.points);
	console.log("<" + Math.min(...playerPoints) + ":" + Math.max(...playerPoints) + ">");
}

console.log('\n');
console.timeEnd('1');

console.log('\n\n');
console.log(front.length);
