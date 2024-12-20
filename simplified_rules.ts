
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

////////////////////////////////////////

// 1 player tree analysis
// no nobles, no reservations or gold

export class TableStruct1 {
	stackLevels: number[]//[number, number, number]
				= [0, 0, 0];
	cardsRow3: number[]//[number, number, number, number]
				= [0, 0, 0, 0];
	cardsRow2: number[]//[number, number, number, number]
				= [0, 0, 0, 0];
	cardsRow1: number[]//[number, number, number, number]
				= [0, 0, 0, 0];
	tokLevels: number[]//[number, number, number, number, number, number]
				= [0, 0, 0, 0, 0, 0];
	
		toBigInt(): BigInt {
			let resStacks = 0n; // 3B roud up to 4
			let resCards3 = 0n; // 4B
			let resCards2 = 0n; // 4B
			let resCards1 = 0n; // 4B
			let resTokens = 0n; // 3B round up to 4
			
			for (const stl of this.stackLevels) {
				resStacks = (resStacks << 8n) | BigInt(stl);
			}

			for (const stl of this.cardsRow3) {
				resCards3 = (resCards3 << 8n) | BigInt(stl);
			}

			for (const stl of this.cardsRow2) {
				resCards2 = (resCards2 << 8n) | BigInt(stl);
			}
			
			for (const stl of this.cardsRow1) {
				resCards1 = (resCards1 << 8n) | BigInt(stl);
			}

			for (const stl of this.tokLevels) {
				resTokens = (resTokens << 4n) | BigInt(stl);
			}

			let finalRes = (resTokens << 32n) | (resStacks);
			finalRes = (finalRes << 32n) | resCards3;
			finalRes = (finalRes << 32n) | resCards2;
			finalRes = (finalRes << 32n) | resCards1;

				console.log("  >>  " + this);
				console.log("   >  " + finalRes.toString(16));
				
			
			return finalRes;
		}
		
		static fromBigInt(n: BigInt): TableStruct1 {
			let res = new TableStruct1();
			
			const str = n.toString(16);

				//let resStacks = 0n; // 3B roud up to 4
				//let resCards3 = 0n; // 4B
				//let resCards2 = 0n; // 4B
				//let resCards1 = 0n; // 4B
				//let resTokens = 0n; // 3B round up to 4
			
			let resCards1 = str.substr(-16*1, 16);
			let resCards2 = str.substr(-16*2, 16);
			let resCards3 = str.substr(-16*3, 16);
			let resStacks = str.substr(-16*4, 16);
			let resTokens = str.substr(-16*5, 6);  // !! Because substr can't start outside the text

			let numsCards1 = str2nums(resCards1, 2, 4);

				console.log(" [[ " + resTokens + " ]] " );
			let numsTokens = str2nums(resTokens, 1, 6);

				console.log("c1: ", numsCards1);
				console.log("tk: ", numsTokens);

			return res;
		}		
	
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
				this.rows[r][c] = this.stacks[r].pop()!;
			}
		}
	}
	
	takeCard(r: number, c: number): CardId {
		const res = this.rows[r-1][c-1];
		this.rows[r-1][c-1] = this.stacks[r-1].pop()!;
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
			res.cardsRow1[i] = this.rows[0]![i];
			res.cardsRow2[i] = this.rows[1]![i];
			res.cardsRow3[i] = this.rows[2]![i];
		}

		for (let i = 0; i < this.tokens.length; i++)
			res.tokLevels[i] = this.tokens[i]!;

		return res;
	}
	
		toBigInt(): BigInt {
			return this.toStruct().toBigInt();
		}
		
		static fromBigInt(b: BigInt): TableState1 {
			let res = new TableState1(); 
			
			const struct = TableStruct1.fromBigInt(b);
			 
			return res;
		}
	
	str(): string {
		return this.toStruct().str();
	}
	
	static fromStr(s: string): TableState1 {
		let res = new TableState1(); 
		
		const struct = TableStruct1.fromStr(s);
		
		for (let i = 0; i < 6; i++)
			res.tokens[i] = struct.tokLevels[i]!;
		
		res.stacks = setupStacks(presetOrder);
		res.fillRows();
		res.rows = [struct.cardsRow1, struct.cardsRow2, struct.cardsRow3];


		for (let i = 0; i < 3; i++) {
			const level = struct.stackLevels[i]!;
			res.stacks[i] = res.stacks[i]!.slice(0, level);
		}
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
	
	str(): string {
		return this.toStruct().str();
	}
	
	static fromStr(s: string): PlayerState1 {
		let res = new PlayerState1();
		
		const struct = PlayerStruct1.fromStr(s);
		
		//	$$$$
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
	
	
	toBigInt(): BigInt {
		return BigInt(0);
	}
	
	static fromBigInt(b: BigInt): GameState1 {
		return new GameState1();
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
	
	// possible next nodes
	//followers: Map<Move1, GameNode1> = new Map<Move1, GameNode1>();
	followersTake: Map<TakeMove1, GameNode1> = new Map<TakeMove1, GameNode1>();
	followersBuy: Map<BuyMove1, GameNode1> = new Map<BuyMove1, GameNode1>();
	
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

export class MoveTree1 {
	root: GameNode1 = new GameNode1();
}

