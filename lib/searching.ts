
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

const INITIAL_TABLE_NUMS: number[][] =
		[ [53, 67, 75, 88],
		  [24, 31, 39, 44], 
		  [ 2,  8, 13, 20] ];


export function getCardPrice(n: number): string {
	const str = CARD_SPECS[n];
	return str.split(':')[1] + "0";
}

export function getCardPoints(n: number): number {
	const str = CARD_SPECS[n];
	return parseInt(str[0]);
}


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

export function statesUnique(states: TokenState[]): TokenState[] {
	return states2map(states).values().toArray();
}


export function states2map(states: TokenState[]): Map<string, TokenState> {
	let res = new Map<string, TokenState>();
	states.forEach(s => {if (!res.has(s.player)) res.set(s.player, s); });
	return res;
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

function tokStateMap(states: TokenState[]): Map<string, TokenState> {
		return new Map(); // Uncomment to switch on real map
	
	const pairs: [string, TokenState][] = states.map(s => [s.table, s]);
	return new Map(pairs);
}



class PlayerCardState {
	bitmap: boolean[] = '0'.repeat(91).split('').map(_ => false);

		vec: number[] = [0, 0, 0, 0, 0, 0]; // 0:4 - num cards per color, [5] - points

	copy(): PlayerCardState {
		let res = new PlayerCardState();
		res.bitmap = structuredClone(this.bitmap);
			res.vec = structuredClone(this.vec);
		return res;		
	}
	
	acquire(c: number): void {
		this.bitmap[c] = true;
			this.vec[(c-1) % 5]++;
			this.vec[5] += getCardPoints(c);
	}
	
	toArr(): number[] {
		let res: number[] = [];
		for (let i = 0; i < this.bitmap.length; i++)
			if (this.bitmap[i]) res.push(i);
		return res;
	}
	
	toStr(): string {
		return this.toArr().toString();
		//return this.tag();
	}
	
	tag(): string {
		return this.vec.map((x) => (100+x).toString().substr(1,2)).join('');
	}

	getBonuses(): string {
		return this.vec.slice(0,5).map(n => Math.min(n, 15).toString(16)).join('') + '0';
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


class TableCardState {
	// the order of cards on stacks is determined by a global variable (so far const INITIAL_TABLE_NUMS)
	
	levels: number[] = [36, 26, 16];
	// 12 bytes: 1 per card
	// 1 [][][][] bytes 0:3
	// 2 [][][][] bytes 4:7
	// 3 [][][][] - highest card values, bytes 8:11
	rows: number[][] = // rows on the table are always sorted (per row!) to prevent exploding number of equivalent states
						structuredClone(INITIAL_TABLE_NUMS);
	
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
		return this.rows.flat().map(x => (100+x).toString().substr(1,2)).join('');
	}
	levelStr(): string {
		return this.levels.map(x => (100+x).toString().substr(1,2)).join('');
	}
	
	toStr(): string {
		return this.levelStr() + this.rowStr();
	}
	
	getCard(index: number): number {
		const row = Math.floor(index/4);
		const col = index % 4;
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
		res.player = this.player.copy();
		res.table = this.table.copy();
		return res;
	}
}


// This represents a bundle of states with common CardState
export class StateGroup {
	tokState: TokenState[] = [new TokenState("000000", "444440")];
		tokStates_N: Map<string,TokenState> = new Map<string,TokenState>([["000000", new TokenState("000000", "444440")]]);
	
	cardState: CardState = new CardState();
	
	copy(): StateGroup {
		let res = new StateGroup();
		res.tokState = this.tokState.map(x => x.copy());
			res.tokStates_N = new Map(this.tokStates_N);
		res.cardState = this.cardState.copy();
			
		return res;
	}

	mergeWith(sg: StateGroup): StateGroup {
		let res = this.copy();
		res.tokState = res.tokState.concat(sg.tokState);
			res.tokStates_N = tokStateMap(res.tokState);
		return res;
	}


	nextStatesBuy(): StateGroup[] {
		let res: StateGroup[] = [];
				
		for (let i = 0; i < 12; i++) { // for each card on table
			const cardId = this.cardState.table.getCard(i);
			const effPrice = this.cardState.player.effectivePrice(cardId);

			const newCardState = this.cardState.copy();
			newCardState.player.acquire(cardId);
			newCardState.table.grab(i);
			
			let newStateGroup = new StateGroup();
			newStateGroup.cardState = newCardState;
			
			newStateGroup.tokState = [];
			
			for (const ts of this.tokState) { // for each tokState
				if (!ts.playerCanBuy(effPrice)) continue;
					
				const newTokState = new TokenState(subStates(ts.player, effPrice), addStates(ts.table, effPrice));
				newStateGroup.tokState.push(newTokState);
			}
			
			newStateGroup.tokStates_N = tokStateMap(newStateGroup.tokState);
			
			if (newStateGroup.tokState.length > 0)
				res.push(newStateGroup);
		}
		
		return res;
	}
	
	nextStateGroupTake(): StateGroup {
		let res = new StateGroup();
		res.cardState = this.cardState.copy();
		
		let newTokStates: TokenState[] = [];
		
		for (const ts of this.tokState) {
			newTokStates = newTokStates.concat(ts.nextStates());
		}
		
		res.tokState = statesUnique(newTokStates);
			res.tokStates_N = tokStateMap(res.tokState);
		
		return res;
	}
	
	nextStates(): StateGroup[] {
		let res = this.nextStatesBuy();
		res.push(this.nextStateGroupTake());
		return res;
	}
	
}


// Represents an array of StateGroups
export class Wave {
	
	stateGroups: StateGroup[] = [];
	
	static fromSG(sg: StateGroup): Wave {
		let res = new Wave();
		res.stateGroups.push(sg.copy());
		return res;
	}
	
	groupSize(): number {
		return this.stateGroups.length;
	}

	stateSize(): number {
		return this.stateGroups.map(x => x.tokState.length).reduce((a,b)=>a+b, 0);
	}
	
	next_Repeating(): Wave {
		let res = new Wave();
		
		//  [ [...], [...], [...], ...]
		const followers = this.stateGroups.map(x => x.nextStates()).flat();		
		res.stateGroups = followers;		
		return res;
	}

	next(): Wave {
		let res = new Wave();
		
		//  [ [...], [...], [...], ...]
		const followers = this.stateGroups.map(x => x.nextStates()).flat();
		
		// find duplicates in cardState
		let map = new Map<string, StateGroup>();
		for (const f of followers) {
			const s = f.cardState.player.toStr(); // TODO: this temporary solution is based only on 1 player's cards
			if (map.has(s)) map.set(s, map.get(s)!.mergeWith(f));
			else map.set(s, f);
		}
		
		res.stateGroups = map.values().toArray();
		
		return res;
	}
	
}
