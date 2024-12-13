
import {Color, ValVector, CardId, Game, setupStacks, getCardPrice, getCardPoints, getCardColor,
		vecAdd, vecSub, vecEnough, vecSum} from './rules.ts';

import { } from './comb.ts';

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


let game = new Game(3, true, presetOrder);
game.dontFill = true;

console.log(game.table.str());
console.log(game.players[0]);


function playMovesSinglePlayer(commands: string[]): void {
	for (const s of commands) {
		if (game.movePlayer(0, s)) {
			console.log("Move valid: " + s);
		}
		else {
			console.log("Move not valid: " + s);
		};
		
	}

	console.log(game.table.strSh());
	console.log('');
	console.log(game.players[0].strSh(0));
	game.sumUp();
}


const moves = [
	"t wgr",
    "t grw",
    "t brk",
	"b 12",
	"b 13",
	
	"t wbg",
	"t brk",
	"b 23",
	
	"twbk",
	"twbk",
	
	"b 22",
	
	"t 2g",
	"t wbg",
	"t bgr",
	"b 34",
	
	"t 2r",
	"t r",
	"t r",
	"b 21",
	
	"t 2r",
	"b 24"
];

////////////////////////////////////////

// 1 player tree analysis
// no nobles, no reservations or gold

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
		}
	}
	
	takeToks(v: ValVector): void {
		for (let i = 0; i < 5; i++) {
			this.tokens[i] -= v[i];
		}
	}
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
		}
	}
	
	takeToks(v: ValVector): void {
		for (let i = 0; i < 5; i++) {
			this.tokens[i] -= v[i];
		}
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
}


class Move1 {
	toks: ValVector = [0, 0, 0, 0, 0, 0];
}

class TakeMove1 extends Move1 {
	
}

class BuyMove1 extends Move1 {
	loc: [number, number] = [0, 0];
}


// Sum 1
const STR_1x1 = [
  "00001", "00010", "00100", "01000", "10000",
];


// Sum 2
const STR_2x1 = [
  "00011", "00110", "01100", "11000", "10001", "00101", "01010", "10100", "01001", "10010",
];

const STR_1x2 = [
  "00002", "00020", "00200", "02000", "20000",
];


// Sum 3
const STR_1x3 = [
  "00003", "00030", "00300", "03000", "30000",
];

const STR_1x2_1x1 = [
  "00012", "00120", "01200", "12000", "20001",
  "00102", "01020", "10200", "02001", "20010",
  "01002", "10020", "00201", "02010", "20100",
  "10002", "00021", "00210", "02100", "21000",
];		

const STR_3x1 = [
  "00111", "01110", "11100", "11001", "10011", "01011", "10110", "01101", "11010", "10101",
];


function vecNonNegative(v: ValVector): boolean {
	return !(v.some((x) => x < 0));
}

function vecLimit0(v: ValVector): ValVector {
	let res: ValVector = [...v];
	
	for (let i = 0; i < 6; i++) {
		if (res[i] < 0) res[i] = 0;
	}
	
	return res;
}


function str2vv(s: string): ValVector {
	let res: ValVector = [0, 0, 0, 0, 0, 0];
	const n = Math.min(s.length, 6);
	for (let i = 0; i < n; i++) {
		res[i] = parseInt(s[i]);
	}
	return res;
}

function vv2str(v: ValVector): string {
	return "[" + v + "]";
}


function crossVecs(takes: string[], returns: string[]): ValVector[] {
	let sums: ValVector[] = [];
	let strSums: string[] = [];
	
	for (const t of takes) {
		for (const r of returns) {
			const added = vecSub(str2vv(t), str2vv(r));
			sums.push(added);
		}
	}
	
	return sums;
}


function encodeVec(v: ValVector): number {
	let res = 0;
	
	for (let i = 5; i >= 0; i--) {
		res *= 16;
		res += (v[i] & 15);
	}
	
	return res;
}

function decodeVec(n: number): ValVector {
	let res: ValVector = [0,0,0,0,0,0];

	for (let i = 0; i < 6; i++) {		
		res[i] = n & 15;
		if (res[i] > 7) res[i] -= 16; // 7 is max toks per color, above are negatives
		n = n >>> 4;
	}

	return res;
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
		const nPlayerToks = vecSum(playerToks);

		const surplus1 = Math.max(0, nPlayerToks + 1 - 10);		  
		const surplus2 = Math.max(0, nPlayerToks + 2 - 10);		  
		const surplus3 = Math.max(0, nPlayerToks + 3 - 10);

		// all threes
		const strs3 = STR_3x1;
		const moves3 = makeMoves(strs3, playerToks, tableToks, surplus3);

		const strs2 = STR_2x1;
		const moves2 = makeMoves(strs2, playerToks, tableToks, surplus2);

		const strs2same = STR_1x2;
		const moves2s = makeMoves(strs2same, playerToks, tableToks, surplus2);

		const strs1 = STR_1x1;
		const moves1 = makeMoves(strs1, playerToks, tableToks, surplus1);

		let allTakeMoves = moves3.concat(moves2).concat(moves2s).concat(moves1);
		
		// Find unique moves
		const encoded = allTakeMoves.map(encodeVec);		
		const unique = new Set<number>(encoded);
		const decoded = [...unique].map(decodeVec);
		
		// Check which moves are impossible because would leave player with negative token states
		let nonNegatives: ValVector[] = [];
		
		for (const v of decoded) {
			const resulting = vecAdd(playerToks, v);
			if (vecNonNegative(resulting)) nonNegatives.push(v);
			
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


function makeMoves(strs: string[], playerToks: ValVector, tableToks: ValVector, surplus: number): ValVector[] {	
	let legalTakes: string[] = [];
	let illegalTakes: string[] = [];
	
	for (const s of strs) {
		const vec = str2vv(s);
		if (!vecEnough(tableToks, vec)) illegalTakes.push(s);
		else legalTakes.push(s);
	}
	
    const rets = getReturns(surplus);
	return crossVecs(legalTakes, rets);
}

function getReturns(surplus: number): string[] {
	if (surplus < 0 && surplus > 3) throw new Error("wrong surplus");
	
	let result: string[] = [];
	
	switch (surplus) {
	case 3:
		result = result.concat(STR_3x1);
		result = result.concat(STR_1x2_1x1);
		result = result.concat(STR_1x3);
		break;
	case 2:
		result = result.concat(STR_2x1);
		result = result.concat(STR_1x2);
		break;
	case 1:
		result = result.concat(STR_1x1);
		break;
	case 0:
		result.push("000000");
	}
	
	return result;
}

class MoveTree1 {
	root: GameNode1 = new GameNode1();
}

let tree = new MoveTree1();

tree.root.state.table.stacks = setupStacks(presetOrder);
tree.root.state.table.fillRows();


const player = tree.root.state.player;
const table = tree.root.state.table;


console.log(tree.root.state);
console.log(table.rows);
console.log(table.stacks);


const stateCopy = tree.root.state.deepCopy();


console.log(tree.root.state);

console.log(stateCopy);

console.log(table.rows);
console.log(table.stacks);

playMovesSinglePlayer(moves);
