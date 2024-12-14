
import {ValVector, satisfies, vecAdd, vecSub, vecEnough, vecSum,
		vecNonNegative, vecLimit0, str2vv, vv2str	} from './valvec.ts'
import {Color, CardId, Game, setupStacks, getCardPrice, getCardPoints, getCardColor,
		} from './rules.ts';

import { STR_1x1, STR_2x1, STR_1x2, STR_1x3, STR_1x2_1x1, STR_3x1,
		crossVecs, encodeVec, decodeVec, getReturns,
		makeMoves, makeAllTakeMoves, uniqueMoves} from './comb.ts';

const presetOrder: number[] = [
   7, 23, 52, 12, 66, 52, 74, 79, 79, 43,  7, 74,
  38,  1, 30, 51, 60, 19, 47, 59, 29, 12, 22, 27,
   3, 41, 20, 11, 13, 31, 27, 42,  1, 32,  3, 42,
  45,  1, 47,  5, 22, 38,  8, 23, 22, 25, 38, 23,
   1, 33, 39, 17, 36, 29,  0, 33, 30,  8, 25,  8,
  27, 19, 21, 22, 23, 15, 17, 14,  8, 12,  0,  3,
   3, 12, 11,  6,  3,  8,  7,  5,  0,  7,  1,  1,
   5,  3,  3,  0,  0,  0
];

////////////////////////////////////////

// 1 player tree analysis
// no nobles, no reservations or gold

class TableStruct1 {
	stackLevels: [number, number, number] = [0, 0, 0];
	cardsRow3: [number, number, number, number]  = [0, 0, 0, 0];
	cardsRow2: [number, number, number, number]  = [0, 0, 0, 0];
	cardsRow1: [number, number, number, number]  = [0, 0, 0, 0];
	tokLevels: [number, number, number, number, number, number]  = [0, 0, 0, 0, 0, 0];
}


class TableState1 {
	tokens: ValVector = [4, 4, 4, 4, 4, 0];
	rows: CardId[][] = [[], [], []];
	stacks: CardId[][] = [];

	deepCopy(): TableState1 {
		let res = new TableState1();
		res.tokens = structuredClone(this.tokens);
		for (let i = 0; i < 3; i++)
			res.rows[i] = structuredClone(this.rows[i]);
		for (let i = 0; i < 3; i++)
			res.stacks[i] = structuredClone(this.stacks[i]);
		
		return res;
	}
	
	fillRows(): void {
		for (let r = 0; r < 3; r++)  {
			for (let c = 0; c < 4; c++)  {
				this.rows[r][c] = this.stacks[r].shift()!;
			}
		}
	}
	
	takeCard(r: number, c: number): CardId {
		const res = this.rows[r-1][c-1];
		this.rows[r-1][c-1] = this.stacks[r-1].shift()!;
		return res;
	}

	addToks(v: ValVector): void {
		for (let i = 0; i < 5; i++) {
			this.tokens[i] += v[i];
			
			if (this.tokens[i] < 0) throw new Error("Negative toks in table");
		}
	}
	
	takeToks(v: ValVector): void {
		for (let i = 0; i < 5; i++) {
			this.tokens[i] -= v[i];
			
			if (this.tokens[i] < 0) throw new Error("Negative toks in table");
		}
	}
	
	toStruct(): TableStruct1 {
		let res = new TableStruct1();

		for (let i = 0; i < this.stacks.length; i++)
			res.stackLevels[i] = this.stacks[i]!.length;

		for (let i = 0; i < 4; i++) {
			res.cardsRow1[i] = this.stacks[0]![i];
			res.cardsRow2[i] = this.stacks[1]![i];
			res.cardsRow3[i] = this.stacks[2]![i];
		}

		for (let i = 0; i < this.tokens.length; i++)
			res.tokLevels[i] = this.tokens[i]!;

		return res;
	}
	
	toBigInt(): BigInt {
		return BigInt(0);
	}
	
	static fromBigInt(b: BigInt): TableState1 {
		return new TableState1();
	}
}


class PlayerStruct1 {
	cardLevels: [number, number, number, number, number] = [0, 0, 0, 0, 0];
	tokLevels: [number, number, number, number, number, number]  = [0, 0, 0, 0, 0, 0];
	reserved: [number, number, number] = [0, 0, 0];
	points: number = 0;
}

class PlayerState1 {
	tokens: ValVector = [0, 0, 0, 0, 0, 0];
						//[1, 2, 3, 3, 0, 0];
	bonuses: ValVector = [0, 0, 0, 0, 0, 0];
						//[3, 0, 0, 0, 4, 0];
	points: number = 0;
	
	cols: CardId[][] = [[], [], [], [], []];
	
	deepCopy(): PlayerState1 {
		let res = new PlayerState1();
		res.tokens = structuredClone(this.tokens);
		res.bonuses = structuredClone(this.bonuses);
		res.points = this.points;
		for (let i = 0; i < 5; i++)
			res.cols[i] = structuredClone(this.cols[i]);
		
		return res;
	}
	
	
	addCard(id: CardId): void {
		const color = getCardColor(id);
		const points = getCardPoints(id);
		
		this.cols[color].push(id);
		this.bonuses[color]++;
		this.points += points;
	}
	
	addToks(v: ValVector): void {
		for (let i = 0; i < 5; i++) {
			this.tokens[i] += v[i];
			
			if (this.tokens[i] < 0) throw new Error("Negative toks in player");
		}
	}
	
	takeToks(v: ValVector): void {
		for (let i = 0; i < 5; i++) {
			this.tokens[i] -= v[i];
			
			if (this.tokens[i] < 0) throw new Error("Negative toks in player");
		}
	}
	
	toStruct(): PlayerStruct1 {
		let res = new PlayerStruct1();

		for (let i = 0; i < this.bonuses.length; i++)
			res.cardLevels[i] = this.bonuses[i]!;

		for (let i = 0; i < this.tokens.length; i++)
			res.tokLevels[i] = this.tokens[i]!;
		
		// No reserved yet
		// for (let i = 0; i < 3; i++)
			// res.tokLevels[i] = this.tokens[i]!;
		
		res.points = this.points;

		return res;
	}


	toBigInt(): BigInt {
		return BigInt(0);
	}
	
	static fromBigInt(b: BigInt): PlayerState1 {
		return new PlayerState1();
	}
}

class GameState1 {
	table: TableState1 = new TableState1();
	player: PlayerState1 = new PlayerState1();
	
	deepCopy(): GameState1 {
		let res = new GameState1();
		res.table = this.table.deepCopy();
		res.player = this.player.deepCopy();
		
		return res;
	}
	
	
	toBigInt(): BigInt {
		return BigInt(0);
	}
	
	static fromBigInt(b: BigInt): GameState1 {
		return new GameState1();
	}
}


class Move1 {
	toks: ValVector = [0, 0, 0, 0, 0, 0];
}

class TakeMove1 extends Move1 {
	
}

class BuyMove1 extends Move1 {
	loc: [number, number] = [0, 0];
}



// Split vec with possible negatives into a legal combination of take and return
function findCanonicalTake(v: ValVector): string {
	// If Y positive -> wrong
	// If more than 3 positives -> wrong
	// If any > 2 -> wrong
	// If has "2" -> take 2 same, rest must be nonpositive OR wrong
    // Otherwise '1's to take, rest to return	
	
	return "";
}	


class GameNode1 {
	state: GameState1 = new GameState1();
	
	// possible next nodes
	//followers: Map<Move1, GameNode1> = new Map<Move1, GameNode1>();
	followersTake: Map<TakeMove1, GameNode1> = new Map<TakeMove1, GameNode1>();
	followersBuy: Map<BuyMove1, GameNode1> = new Map<BuyMove1, GameNode1>();
	
	fillFollowers(): void {
		this.TMP_fillTakes();
		this.TMP_fillBuys();
	}

	TMP_fillBuys(): void {
		const player = this.state.player;
		const table = this.state.table;
		
		for (let r = 1; r < 4; r++) {
			for (let c = 1; c < 5; c++) {
				const id = this.state.table.rows[r-1][c-1];
				const price = getCardPrice(id);
				const budget = vecAdd(this.state.player.tokens, this.state.player.bonuses);
				if (vecEnough(budget, price)) {
					const realPrice = vecLimit0(vecSub(price, this.state.player.bonuses));
					
					let newState = this.state.deepCopy();
					newState.player.addCard(newState.table.takeCard(r, c));
					newState.player.takeToks(realPrice);
					newState.table.addToks(realPrice);
					
					const newMove: BuyMove1 = {toks: realPrice, loc: [r, c]};
					
					let newNode = new GameNode1();
					newNode.state = newState;
					
					this.followersBuy.set(newMove, newNode);
				}
			}
		}
	}	


	TMP_fillTakes(): void {
		const playerToks = this.state.player.tokens;
		const tableToks = this.state.table.tokens;
		
		// all Take moves possible
		const allTakeMoves = makeAllTakeMoves(playerToks, tableToks);
		const decoded = uniqueMoves(allTakeMoves);
		
		// Check which moves are impossible because would leave player with negative token states
		
		for (const v of decoded) {
			const resulting = vecAdd(playerToks, v);
			if (!vecNonNegative(resulting))
				continue;
			let newState = this.state.deepCopy();
			newState.table.takeToks(v);
			newState.player.addToks(v);
			const newMove: TakeMove1 = {toks: v};
			
			let newNode = new GameNode1();
			newNode.state = newState;
			
			this.followersTake.set(newMove, newNode);
		}
		
	}
}

class MoveTree1 {
	root: GameNode1 = new GameNode1();
}

let tree = new MoveTree1();

tree.root.state.table.stacks = setupStacks(presetOrder);
tree.root.state.table.fillRows();


const player = tree.root.state.player;
const table = tree.root.state.table;
const stateCopy = tree.root.state.deepCopy();
console.log(stateCopy);
console.log(table.rows);
console.log(table.stacks);


let viewedNode = tree.root;
let iter = 0;

while (iter++ < 10) {
	viewedNode.fillFollowers();
		
	console.log("Move " + iter + "-----------------------------------------------------------");
	console.log("P toks: " + viewedNode.state.player.tokens + ", T toks: " + viewedNode.state.table.tokens);
	
	console.log("Takes: " + viewedNode.followersTake.size + ", buys " + viewedNode.followersBuy.size);
	
	if (viewedNode.followersBuy.size > 0) {
		const chosenMove = viewedNode.followersBuy.keys().next().value;
		viewedNode = viewedNode.followersBuy.values().next().value;
		console.log("chose Buy " + chosenMove.toks + " @ " + chosenMove.loc + "\n");
	}
	else {
		const chosenMove = viewedNode.followersTake.keys().next().value;
		viewedNode = viewedNode.followersTake.values().next().value;
		console.log("chose Take " + chosenMove.toks + "\n");
	}
	
}

console.log("Conv:");
console.log(viewedNode.state.table.toBigInt());
console.log(TableState1.fromBigInt(5n));

console.log(viewedNode.state.table.toStruct());

console.log(viewedNode.state.player.toStruct());

