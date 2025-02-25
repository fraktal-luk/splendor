

import {
STR_1x1,
STR_2x1,
STR_1x2,
STR_1x3,
STR_1x2_1x1,
STR_3x1,
getReturns
} from './comb.ts';

import {cardStringList} from './rules.ts';


export const CARD_SPECS: string[] = [''].concat(cardStringList.flat());


// each stack is drained form the end, 4 last elements in each are on the table from the start
export const TABLE_STACKS: number[][] =
[
  [ // lowest cards
    62, 65, 51, 82, 74, 63, 64, 56, 69, 81,
    55, 54, 73, 71, 57, 79, 76, 70, 85, 89,
    78, 68, 72, 58, 59, 66, 77, 86, 87, 60,
    61, 52, 84, 90, 83, 80, 75, 88, 67, 53
  ],
  [
    27, 25, 29, 38, 36, 35, 22, 45, 41,
    37, 40, 34, 47, 49, 26, 50, 46, 33,
    43, 32, 21, 42, 28, 23, 30, 48, 31,
    39, 44, 24
  ],
  [
     3, 10,  5, 11, 17, 7, 19,
    15, 16,  1, 18,  9, 6, 14,
    12,  4, 20,  2, 13, 8
  ]
];



function take2ifPossible(take: string, table: string): string | null {
	const lenA = take.length;
	for (let i = 0; i < 6; i++) {
		if (parseInt(take[i], 16) > 1 && parseInt(table[i]) < 4) return null;
	}
	return take;
}

function sumState(stateA: string): number {
	const lenA = stateA.length;
	let res = 0;
	for (let i = 0; i < 6; i++) {
		res += parseInt(stateA[i], 16);
	}
	return res;
}

function minStates(stateA: string, stateB: string): string {
	const lenA = stateA.length;
	let res = "      ".split('');
	for (let i = 0; i < 6; i++) {
		res[i] = Math.min(parseInt(stateA[i], 16), parseInt(stateB[i], 16)).toString(16);
	}
	res[5] = '0';
	return res.join('');
}

function maxStates(stateA: string, stateB: string): string {
	const lenA = stateA.length;
	let res = "      ".split('');
	for (let i = 0; i < 6; i++) {
		res[i] = Math.max(parseInt(stateA[i], 16), parseInt(stateB[i], 16)).toString(16);
	}
	res[5] = '0';
	return res.join('');
}

function addStates(stateA: string, stateB: string): string {
	const lenA = stateA.length;
	let res = "      ".split('');
	for (let i = 0; i < 6; i++) {
		res[i] = (parseInt(stateA[i], 16) + parseInt(stateB[i], 16)).toString(16);
	}
	res[5] = '0';
	return res.join('');
}

function subStates(stateA: string, stateB: string): string {
	const lenA = stateA.length;
	let res = "      ".split('');
	for (let i = 0; i < 6; i++) {
		res[i] = (parseInt(stateA[i], 16) - parseInt(stateB[i], 16)).toString(16);
	}
	res[5] = '0';
	return res.join('');
}

function enoughStates(stateA: string, stateB: string): boolean {
	const lenA = stateA.length;
	for (let i = 0; i < 6; i++) {
		if (parseInt(stateA[i], 16) < parseInt(stateB[i], 16)) return false;
	}
	return true;
}

function applyTakes(state: string): string[] {
	const take3 = STR_3x1.map(s => addStates(s, state));
	const take2 = STR_1x2.map(s => addStates(s, state));
	return take3.concat(take2);
}

function applyTakesEach(states: string[]): string[] {
	const arr = states.map(s => applyTakes(s));
	return arr.flat();
}

function reductionForState(stateA: string, red: string): string | null{
	const lenA = stateA.length;
	for (let i = 0; i < 6; i++) {
		if (parseInt(stateA[i], 16) < parseInt(red[i], 16)) return null;
	}
	return red;
}

function returnsForPlayer(player: string, reductions: string[]): string[] {
	return reductions.map(r => reductionForState(player, r)).filter(s => s != null);
}



const ENABLE_SMALL_TAKES = true;

export class TokenState {
	player: string;// = "000000";
	table: string;// = "444440"; 

	constructor(p: string, t: string) {
		this.player = p;
		this.table = t;
	}

	copy(): TokenState {
		return new TokenState(this.player, this.table);
	}

		// CAREFUL: bonuses must be already applied because this class doesn't know about cards
		playerCanBuy(price: string): boolean {
			return enoughStates(this.player, price);
		}

	playerTokSum(): number {
		return sumState(this.player);
	}

	nextMoves(): string[] {		
		const takes3 = STR_3x1.map(s => minStates(s, this.table)).filter(s => sumState(s) != 0);
		const takes2 = STR_1x2.map(s => take2ifPossible(s, this.table)).filter(s => s != null) as string[];
		
		if (ENABLE_SMALL_TAKES) {
			const takesSmall = STR_2x1.concat(STR_1x1).map(s => minStates(s, this.table)).filter(s => sumState(s) != 0);
			return takes3.concat(takes2).concat(takesSmall);
		}
		else return takes3.concat(takes2);
	}
	
	nextStates(): TokenState[] {
		const moves = this.nextMoves();
		let res: TokenState[] = [];
		
		for (const m of moves) {
			const playerNew = addStates(this.player, m);
			const tableNew = subStates(this.table, m);
			const sum = sumState(playerNew);

			if (sum > 10) {
				const surplus = sum - 10;
				const allReturns = getReturns(surplus);
				const returns = returnsForPlayer(playerNew, allReturns);
				for (const r of returns) {
					const playerNewR = subStates(playerNew, r);
					const tableNewR = addStates(tableNew, r);
					res.push(new TokenState(playerNewR, tableNewR));
				}
			}
			else res.push(new TokenState(playerNew, tableNew));
				
		}
		return res;
	}
	
	nextStatesUnique(): TokenState[] {
		return statesUnique(this.nextStates());
	}
}


export function statesUnique(states: TokenState[]): TokenState[] {
	return states2map(states).values().toArray();
}


export function states2map(states: TokenState[]): Map<string, TokenState> {
	let res = new Map<string, TokenState>();
	
	states.forEach(s => {if (!res.has(s.player)) res.set(s.player, s); });
	
	return res;
}

export function moveFront(states: TokenState[]): TokenState[] {
	const next = states.map(s => s.nextStatesUnique()).flat();
	return statesUnique(next);
}



class PlayerCardState {
	// 90 cards, numbers 1 to 90
	// 8*12 = 96 -> 12 bytes contains all possible subsets of cards
	// bit [0] is unused, [1:90] represent cards
	// Bytes are represented as hex
	// Each byte is big endian: [7 6 5 4 3 2 1 0][f e d c b a 9 8] ...
	//str: string = ['00', '00', '00', '00', '00', '00', '00', '00', '00', '00', '00', '00',].join('');
	
	bitmap: boolean[] = '0'.repeat(91).split('').map(_ => false);

	copy(): PlayerCardState {
		let res = new PlayerCardState();
		res.bitmap = structuredClone(this.bitmap);
		return res;		
	}

	has(c: number): boolean {
		return false;
	}
	
	acquire(c: number): void {
		this.bitmap[c] = true;
	}
	
	toArr(): number[] {
		let res: number[] = [];
		for (let i = 0; i < this.bitmap.length; i++)
			if (this.bitmap[i]) res.push(i);
		return res;
	}
	
	toStr(): string {
		return this.toArr().toString();
	}
	
	
	getBonuses(): string {
		let hist = [0, 0, 0, 0, 0, 0];
		// with colors 0:5
		// color of card K: (K-1) % 5
		this.toArr().forEach(k => hist[(k-1) % 5]++);
		
		return hist.map(n => Math.min(n, 15).toString(16)).join('');
	}		
	
	
	// Price to pay regarding this player's bonuses
	effectivePrice(n: number): string {
		const basePrice = getCardPrice(n);
		const bonuses = this.getBonuses();
		
		// max(0, a - b)
		//  a => b -> a-b, b == min(a, b) 
		//  a < b  -> 0 == a-a, a == min(a, b)
		// max(0, a-b) == a - min(a, b)
		const reduction = minStates(bonuses, basePrice);
		return subStates(basePrice, reduction);
	}
	
}



const INITIAL_TABLE_NUMS: number[][] =
		[ [53, 67, 75, 88],
		  [24, 31, 39, 44], 
		  [ 2,  8, 13, 20] ];
//const INITIAL_TABLE_STR: string = INITIAL_TABLE_NUMS.map(n => (n+256).toString(16).substr(1,2)).join('');


class TableCardState {
	// the order of cards on stacks is determined by a global variable (so far const presetOrder)
	
	levels: number[] = [36, 26, 16];
	// 12 bytes: 1 per card
	// 1 [][][][] bytes 0:3
	// 2 [][][][] bytes 4:7
	// 3 [][][][] - highest card values, bytes 8:11
	rows: number[][] = // rows on the table are always sorted (per row!) to prevent exploding number of equivalent states
		INITIAL_TABLE_NUMS;
	
	copy(): TableCardState {
		let res = new TableCardState();
		res.levels = structuredClone(this.levels);
		res.rows = structuredClone(this.rows);
		return res;
	}
	
	
	// indexing from 0
	getRow(n: number): number[] {
		return this.rows[n];
	}
	
	rowStr(): string {
		//return this.rows.flat().map(n => (n+256).toString(16).substr(1,2)).join('');
		return this.rows.flat().toString();
	}
	levelStr(): string {
		//return this.levels.map(n => (n+256).toString(16).substr(1,2)).join('');
		return this.levels.toString();
	}
	
	getCard(index: number): number {
		const row = Math.floor(index/4);
		const col = index % 4;
		this.levels[row]--;
		return this.rows[row][col];
	}
	
	// index from 0 to 11, card in this.rows
	grab(index: number): void {
		const row = Math.floor(index/4);
		const col = index % 4;
		this.levels[row]--;
		const replacement = TABLE_STACKS[row][this.levels[row]];
		this.rows[row][col] = replacement;

		this.rows[row].sort((a: number, b: number) => a-b);
	}
}


export class CardState {
	player: PlayerCardState = new PlayerCardState();
	table: TableCardState = new TableCardState();
	
	copy(): CardState {
		let res = new CardState();
		res.player = new PlayerCardState();
		res.table = new TableCardState();
		return res;
	}
}

export class FullState {
	tokState: TokenState = new TokenState("000000", "444440");
	cardState: CardState = new CardState();
	
	copy(): FullState {
		let res = new FullState();
		res.tokState = this.tokState.copy();		
		res.cardState = this.cardState.copy();		
		return res;
	}
	
	nextStatesBuy(): FullState[] {
		let res: FullState[] = [];
		
		for (let i = 0; i < 12; i++) {
			const cardId = this.cardState.table.getCard(i);
			//const basePrice = getCardPrice(cardId);
			const effPrice = this.cardState.player.effectivePrice(cardId);
			
			if (this.tokState.playerCanBuy(effPrice)) {
				const newTokState = new TokenState(subStates(this.tokState.player, effPrice), addStates(this.tokState.table, effPrice));
				const newCardState = this.cardState.copy();
				newCardState.player.acquire(cardId);
				newCardState.table.grab(i);
				let newFullState = new FullState();
				newFullState.tokState = newTokState;
				newFullState.cardState = newCardState;
				
				res.push(newFullState);
			}
			
		}
		
		return res;
	}
	
}



export function getCardPrice(n: number): string {
	const str = CARD_SPECS[n];
	return str.split(':')[1] + "0";
}



