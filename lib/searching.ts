

import {
STR_1x1,
STR_2x1,
STR_1x2,
STR_1x3,
STR_1x2_1x1,
STR_3x1,
getReturns
} from './comb.ts';


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

export function sumState(stateA: string): number {
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
	str: string = "";
	
	has(c: number): boolean {
		return false;
	}
	
	acquire(c: number): void {
		
	}
	
	toArr(): number[] {
		return [];
	}
}



const INITIAL_TABLE_NUMS: number[] =
		[ 53, 67, 75, 88,
		  24, 31, 39, 44, 
		   2,  8, 13, 20 ];
const INITIAL_TABLE_STR: string = INITIAL_TABLE_NUMS.map(n => (n+256).toString(16).substr(1,2)).join('');


class TableCardState {
	// the order of cards on stacks is determined by a global variable (so far const presetOrder)
	
	levels: number[] = [36, 26, 16];
	// 12 bytes: 1 per card
	// 1 [][][][] bytes 0:3
	// 2 [][][][] bytes 4:7
	// 3 [][][][] - highest card values, bytes 8:11
	rows: string = // rows on the table are always sorted (per row!) to prevent exploding number of equivalent states
		INITIAL_TABLE_STR;
}


export class CardState {
	player: PlayerCardState = new PlayerCardState();
	table: TableCardState = new TableCardState();
}

