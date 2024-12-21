
import {ValVector, satisfies, vecAdd, vecSub, vecEnough, vecSum,
		vecNonNegative, vecLimit0, str2vv, vv2str	} from './valvec.ts'
import {Color, CardId, Game, setupStacks, getCardPrice, getCardPoints, getCardColor,
		} from './rules.ts';

import {TableStruct1, TableState1, PlayerStruct1, PlayerState1, GameState1, GameNode1,
		MoveTree1, BuyMove1, TakeMove1, presetOrder} from './simplified_rules.ts'


let tree = new MoveTree1();

tree.root.state.table.stacks = setupStacks(presetOrder);
tree.root.state.table.constStacks = setupStacks(presetOrder);
tree.root.state.table.stackNums = tree.root.state.table.stacks.map(a => a.length);
tree.root.state.table.fillRows();
tree.root.state.table.stackNums = tree.root.state.table.stacks.map(a => a.length);



const player = tree.root.state.player;
const table = tree.root.state.table;

console.log(table.rows);
console.log(table.stacks);


let viewedNode = tree.root;
let iter = 0;



let front = [tree.root];

console.log(front);

console.time('1');


while (iter++ <= 5-2) {
	let newFront: GameNode1[] = [];
	
	for (let s of front) {
		s.fillFollowers();
		newFront = newFront.concat(Array.from(s.followersBuy.values())).concat(Array.from(s.followersTake.values()));
	}
	front = newFront;

	const strs = front.map(x => x.state.str());
	const strSet = new Set(strs);

	const uniqueStrs = Array.from(strSet.values());
	
	const recreated = uniqueStrs.map(s => GameNode1.fromState(GameState1.fromStr(s)));

	console.log('All ' + front.length + ", unique " + strSet.size);
	
	front = recreated;
	
	const playerPoints = front.map(x => x.state.player.points);
	console.log("<" + Math.min(...playerPoints) + ":" + Math.max(...playerPoints) + ">");
}

console.log('\n');
console.timeEnd('1');

console.log('\n\n');
console.log(front.length);

	// const nd = front.find(x => x.state.player.points > 0)!;

	// const tmpNode = nd.state.table;

	// console.log(tmpNode);
	// console.log(TableState1.fromStr(tmpNode.str()));
