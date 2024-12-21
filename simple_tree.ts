
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
//let frontS = [tree.root.state];

console.log(front);
console.time('1');

while (iter++ <= 5 - 1) {
	//let newFront: GameNode1[] = [];
	let newFrontS: GameState1[] = [];
	
	for (let i = 0; i < front.length; i++) {
	//for (let n of front) {
		let n = front[i]!;
		//let s = frontS[i]!;
		
		n.fillFollowers();
		//newFront = newFront.concat(Array.from(n.followersBuy.values())).concat(Array.from(n.followersTake.values()));
		newFrontS = newFrontS.concat(n.possibleBuy).concat(n.possibleTake);
	}
	//front = newFront;
	//frontS = newFrontS;

	//const strs = front.map(x => x.state.str());
	const strs = newFrontS.map(x => x.str());

		for (let i = 0; i < strs.length; i++) {
		//	if (strs[i] != strsS[i]) throw new Error("worng str");
		}

	const strSet = new Set(strs);

	const uniqueStrs = Array.from(strSet.values());
	
	const recreated = uniqueStrs.map(s => GameNode1.fromState(GameState1.fromStr(s)));
	//	const recreatedS = uniqueStrs.map(s => GameState1.fromStr(s));

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
