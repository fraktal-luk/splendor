
import {ValVector, satisfies, vecAdd, vecSub, vecEnough, vecSum,
		vecNonNegative, vecLimit0, str2vv, vv2str	} from './valvec.ts'
import {Color, CardId, Game, setupStacks, getCardPrice, getCardPoints, getCardColor,
		} from './rules.ts';

import { STR_1x1, STR_2x1, STR_1x2, STR_1x3, STR_1x2_1x1, STR_3x1,
		crossVecs, encodeVec, decodeVec, getReturns,
		makeMoves, makeAllTakeMoves, uniqueMoves,
		str2nums, charPairs, cutArray} from './comb.ts';

export const presetOrder: number[] = [
   7, 23, 52, 12, 66, 52, 74, 79, 79, 43,  7, 74,
  38,  1, 30, 51, 60, 19, 47, 59, 29, 12, 22, 27,
   3, 41, 20, 11, 13, 31, 27, 42,  1, 32,  3, 42,
  45,  1, 47,  5, 22, 38,  8, 23, 22, 25, 38, 23,
   1, 33, 39, 17, 36, 29,  0, 33, 30,  8, 25,  8,
  27, 19, 21, 22, 23, 15, 17, 14,  8, 12,  0,  3,
   3, 12, 11,  6,  3,  8,  7,  5,  0,  7,  1,  1,
   5,  3,  3,  0,  0,  0
];

export const presetStacks: CardId[][] = setupStacks(presetOrder);


////////////////////////////////////////

// 1 player tree analysis
// no nobles, no reservations or gold

export class TableStruct1 {
	stackLevels: number[] = [0, 0, 0];
	cardsRow3: number[] = [0, 0, 0, 0];
	cardsRow2: number[] = [0, 0, 0, 0];
	cardsRow1: number[] = [0, 0, 0, 0];
	tokLevels: number[] = [0, 0, 0, 0, 0, 0];

	str(): string {
		const tokStr = this.tokLevels.map(x => x.toString(16).substr(0,1)).join('');
		const rest = [...this.stackLevels, ...this.cardsRow3, ...this.cardsRow2, ...this.cardsRow1];
		const restStr = rest.map(x => x.toString(16).padStart(2,'0')).join('');
		
		return tokStr + restStr;
	}
	
	static fromStr(s: string): TableStruct1 {
		let res = new TableStruct1();
		
		const st = s.substr(0, 6);
		const restString = s.substr(6, s.length);
		
		const pairs = charPairs(restString);
		
		let toks = st.split('').map(s => parseInt(s, 16));
		let ints = pairs.map(s => parseInt(s, 16));

		res.tokLevels = toks;
		
		const cut = cutArray(ints, [3, 4, 4, 4]);
				
		res.stackLevels = cut.shift()!;
		res.cardsRow3 = cut.shift()!;
		res.cardsRow2 = cut.shift()!;
		res.cardsRow1 = cut.shift()!;
		
		return res;
	}
	
}


export class TableState1 {
	tokens: ValVector = [4, 4, 4, 4, 4, 0];
	rows: CardId[][] = [[], [], []];
	stackNums: number[] = [-1, -1, -1];


	deepCopy(): TableState1 {
		let res = new TableState1();
		res.tokens = structuredClone(this.tokens);
		for (let i = 0; i < 3; i++)
			res.rows[i] = structuredClone(this.rows[i]);

		res.stackNums = structuredClone(this.stackNums);
		
		return res;
	}
	
	init(presetStacks: CardId[][]): void {
		this.stackNums = presetStacks.map(a => a.length);
		this.fillRows();
	}
	
	fillRows(): void {
		for (let row = 0; row < 3; row++) {
			for (let col = 0; col < 4; col++) {				
				this.stackNums[row]--;
				this.rows[row][col] = presetStacks[row]!.at(this.stackNums[row])!;
			}		
			this.rows[row]!.sort((a: number, b: number) => a-b);
		}
	}
	
	takeCard(r: number, c: number): CardId {
		const row = r-1;
		const col = c-1;
		
		const res = this.rows[row][col];

		this.stackNums[row]--;
		this.rows[row][col] = presetStacks[row]!.at(this.stackNums[row])!;
		// Sort row
		this.rows[row]!.sort((a: number, b: number) => a-b);

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

		for (let i = 0; i < this.stackNums.length; i++)
			res.stackLevels[i] = this.stackNums[i];
			
		for (let i = 0; i < 4; i++) {
			res.cardsRow1[i] = this.rows[0]![i];
			res.cardsRow2[i] = this.rows[1]![i];
			res.cardsRow3[i] = this.rows[2]![i];
		}

		for (let i = 0; i < this.tokens.length; i++)
			res.tokLevels[i] = this.tokens[i]!;

		return res;
	}

	str(): string {
		return this.toStruct().str();
	}
	
	static fromStr(s: string): TableState1 {
		let res = new TableState1(); 
		
		const struct = TableStruct1.fromStr(s);		
		res.init(presetStacks);
		
		res.stackNums = struct.stackLevels;
		res.rows = [struct.cardsRow1, struct.cardsRow2, struct.cardsRow3];

		for (let i = 0; i < 6; i++)
			res.tokens[i] = struct.tokLevels[i]!;
		
		return res;
	}

}


export class PlayerStruct1 {
	tokLevels: number[]  = [0, 0, 0, 0, 0, 0];
	cardLevels: number[] = [0, 0, 0, 0, 0, 0];
	reserved: number[] = [0, 0, 0];
	points: number = 0;

	str(): string {
		let res = "";
		const tokStr = this.tokLevels.map(x => x.toString(16).substr(0,1)).join('');
		const cardStr = this.cardLevels.map(x => x.toString(16).padStart(2,'0')).join('');
		const pointStr = this.points.toString(16).padStart(2, '0');

		return tokStr + cardStr + pointStr;
		return res;
	}

	static fromStr(s: string): PlayerStruct1 {
		let res = new PlayerStruct1();
		
		const tokStr = s.substr(0, 6);
		const restStr = s.substr(6, s.length-6);

		const pairs = charPairs(restStr);
		
		let toks = tokStr.split('').map(s => parseInt(s, 16));
		let ints = pairs.map(s => parseInt(s, 16));

		res.tokLevels = toks;
		
		const cut = cutArray(ints, [6, 1]);
		
		res.cardLevels = cut.shift()!;
		res.points = cut.shift()![0];
		
		return res;
	}
}

export class PlayerState1 {
	tokens: ValVector = [0, 0, 0, 0, 0, 0];
	bonuses: ValVector = [0, 0, 0, 0, 0, 0];
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
		
		res.cardLevels = structuredClone(this.bonuses);
		res.tokLevels = structuredClone(this.tokens);
		
		res.points = this.points;

		return res;
	}


	str(): string {
		return this.toStruct().str();
	}
	
	static fromStr(s: string): PlayerState1 {
		let res = new PlayerState1();
		
		const struct = PlayerStruct1.fromStr(s);
		
		for (let i = 0; i < 6; i++) {
			res.tokens[i] = struct.tokLevels[i]!;
			res.bonuses[i] = struct.cardLevels[i]!;
		}
		
		res.points = struct.points;

		return res;
	}
}

export class GameState1 {
	table: TableState1 = new TableState1();
	player: PlayerState1 = new PlayerState1();
	
	deepCopy(): GameState1 {
		let res = new GameState1();
		res.table = this.table.deepCopy();
		res.player = this.player.deepCopy();
		
		return res;
	}


	findBuys(): GameState1[] {
		let res: GameState1[] = [];

		const player = this.player;
		const table = this.table;
		
		for (let r = 1; r < 4; r++) {
			for (let c = 1; c < 5; c++) {
				const id = table.rows[r-1][c-1];
				const price = getCardPrice(id);
				const budget = vecAdd(player.tokens, player.bonuses);
				if (!vecEnough(budget, price)) continue;

				const realPrice = vecLimit0(vecSub(price, player.bonuses));
				
				let newState = this.deepCopy();
				newState.player.addCard(newState.table.takeCard(r, c));
				newState.player.takeToks(realPrice);
				newState.table.addToks(realPrice);
				
				res.push(newState);
			}
		}
		
		return res;
	}


	findTakes(): GameState1[] {
		let res: GameState1[] = [];
		
		const playerToks = this.player.tokens;
		const tableToks = this.table.tokens;
		
		// all Take moves possible
		const allTakeMoves = makeAllTakeMoves(playerToks, tableToks);
		const decoded = uniqueMoves(allTakeMoves);
		
		// Check which moves are impossible because would leave player with negative token states
		
		for (const v of decoded) {
			const resulting = vecAdd(playerToks, v);
			if (!vecNonNegative(resulting)) continue;

			let newState = this.deepCopy();
			newState.table.takeToks(v);
			newState.player.addToks(v);
			
			res.push(newState);
		}
		
		return res;
	}


	str(): string {
		return this.table.str() + this.player.str(); 
	}
	
	static fromStr(s: string): GameState1 {
		let res = new GameState1();
		
		const PLEN = res.player.str().length;

		res.table = TableState1.fromStr(s.substr(0, s.length-PLEN));
		res.player = PlayerState1.fromStr(s.substr(s.length-PLEN, PLEN));
		return res;
	}
}


export class Move1 {
	toks: ValVector = [0, 0, 0, 0, 0, 0];
}

export class TakeMove1 extends Move1 {
	
}

export class BuyMove1 extends Move1 {
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


export class GameNode1 {
	state: GameState1 = new GameState1();

		possibleBuy: GameState1[] = [];
		possibleTake: GameState1[] = [];
	
	static fromState(gs: GameState1): GameNode1 {
		let res = new GameNode1();
		res.state = gs;
		return res;
	}
	
	fillFollowers(): void {
		this.TMP_fillTakes();
		this.TMP_fillBuys();
	}

	TMP_fillBuys(): void {
		this.possibleBuy = this.state.findBuys();
	}

	TMP_fillTakes(): void {
		this.possibleTake = this.state.findTakes();
	}
	
}

export class MoveTree1 {
	root: GameNode1 = new GameNode1();
}

