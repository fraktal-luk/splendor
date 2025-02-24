

import {
STR_1x1,
STR_2x1,
STR_1x2,
STR_1x3,
STR_1x2_1x1,
STR_3x1,
getReturns
} from './comb.ts';


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

