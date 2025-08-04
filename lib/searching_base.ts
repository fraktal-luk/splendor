
export const cardStringList = [
// Color     W     		B     	   G     	  R     	 K
// row 3
	[  		"5:30007", "5:73000", "5:07300", "5:00730", "5:00073", 	
			"4:00007", "4:70000", "4:07000", "4:00700", "4:00070",
			"4:30036", "4:63003", "4:36300", "4:03630", "4:00363",
			"3:03353", "3:30335", "3:53033", "3:35303", "3:33530",
	],
// row 2
	[  		"3:60000", "3:06000", "3:00600", "3:00060", "3:00006", 	
			"2:00053", "2:53000", "2:05300", "2:30005", "2:00530",
			"2:00050", "2:05000", "2:00500", "2:00005", "2:50000",
			"2:00142", "2:20014", "2:42001", "2:14200", "2:01420",
			"1:23030", "1:02303", "1:30230", "1:03023", "1:30302",
			"1:00322", "1:02230", "1:23002", "1:20023", "1:32200",
	],
// row 1
	[  		"1:00400", "1:00040", "1:00004", "1:40000", "1:04000", 	
			"0:31001", "0:01310", "0:13100", "0:10013", "0:00131",
			"0:03000", "0:00003", "0:00030", "0:30000", "0:00300",
			"0:02201", "0:10220", "0:01022", "0:20102", "0:22010",
			"0:02002", "0:00202", "0:02020", "0:20020", "0:20200",
			"0:01211", "0:10121", "0:11012", "0:21101", "0:12110",
			"0:00021", "0:10002", "0:21000", "0:02100", "0:00210",
			"0:01111", "0:10111", "0:11011", "0:11101", "0:11110",
	]
];


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

export const INITIAL_TABLE_NUMS: number[][] =
		[ [53, 67, 75, 88],
		  [24, 31, 39, 44], 
		  [ 2,  8, 13, 20] ];




export const CARD_SPECS: string[] = [''].concat(cardStringList.flat());


// Sum 1
export const STR_1x1 = ["00001", "00010", "00100", "01000", "10000",];

// Sum 2
export const STR_2x1 = ["00011", "00110", "01100", "11000", "10001", "00101", "01010", "10100", "01001", "10010",];
export const STR_1x2 = ["00002", "00020", "00200", "02000", "20000",];

// Sum 3
export const STR_1x3 = ["00003", "00030", "00300", "03000", "30000",];
export const STR_1x2_1x1 = [
  "00012", "00120", "01200", "12000", "20001",
  "00102", "01020", "10200", "02001", "20010",
  "01002", "10020", "00201", "02010", "20100",
  "10002", "00021", "00210", "02100", "21000",
];		
export const STR_3x1 = ["00111", "01110", "11100", "11001", "10011", "01011", "10110", "01101", "11010", "10101",];

export const STR_RET3 = STR_3x1.concat(STR_1x2_1x1).concat(STR_1x3);
export const STR_RET2 = STR_2x1.concat(STR_1x2);
export const STR_RET1 = STR_1x1;


export function sortRows(arr: number[]): number[] {
	const unsorted = [arr.slice(0, 4), arr.slice(4, 8), arr.slice(8, 12)];
	const sorted = unsorted.map(x => x.toSorted((a,b) => a-b));
	return sorted.flat();
}

export function getReturns(surplus: number): string[] {
	switch (surplus) {
	case 3:
		return STR_3x1.concat(STR_1x2_1x1).concat(STR_1x3);
	case 2:
		return STR_2x1.concat(STR_1x2);
	case 1:
		return STR_1x1;
	case 0:
		return ["000000"];
	default: throw new Error("wrong surplus");
	}
}


export function getCardPrice(n: number): string {
	const str = CARD_SPECS[n];
	return str.split(':')[1] + "0";
}

export function getCardPoints(n: number): number {
	const str = CARD_SPECS[n];
	return parseInt(str[0]);
}


export function take2ifPossible(take: string, table: string): string | null {
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

export function minStates(stateA: string, stateB: string): string {
	const lenA = stateA.length;
	let res = "      ".split('');
	for (let i = 0; i < 6; i++) {
		res[i] = Math.min(parseInt(stateA[i], 16), parseInt(stateB[i], 16)).toString(16);
	}
	res[5] = '0';
	return res.join('');
}

export function maxStates(stateA: string, stateB: string): string {
	const lenA = stateA.length;
	let res = "      ".split('');
	for (let i = 0; i < 6; i++) {
		res[i] = Math.max(parseInt(stateA[i], 16), parseInt(stateB[i], 16)).toString(16);
	}
	res[5] = '0';
	return res.join('');
}

export function addStates(stateA: string, stateB: string): string {
	const lenA = stateA.length;
	let res = "      ".split('');
	for (let i = 0; i < 6; i++) {
		res[i] = (parseInt(stateA[i], 16) + parseInt(stateB[i], 16)).toString(16);
	}
	res[5] = '0';
	return res.join('');
}

export function subStates(stateA: string, stateB: string): string {
	const lenA = stateA.length;
	let res = "      ".split('');
	for (let i = 0; i < 6; i++) {
		res[i] = (parseInt(stateA[i], 16) - parseInt(stateB[i], 16)).toString(16);
	}
	res[5] = '0';
	return res.join('');
}

export function enoughStates(stateA: string, stateB: string): boolean {
	const lenA = stateA.length;
	for (let i = 0; i < 6; i++) {
		if (parseInt(stateA[i], 16) < parseInt(stateB[i], 16)) return false;
	}
	return true;
}


export function reductionForState(stateA: string, red: string): string | null{
	const lenA = stateA.length;
	for (let i = 0; i < 6; i++) {
		if (parseInt(stateA[i], 16) < parseInt(red[i], 16)) return null;
	}
	return red;
}

export function returnsForPlayer(player: string, reductions: string[]): string[] {
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

export function tokStateMap(states: TokenState[]): Map<string, TokenState> {	
	const pairs: [string, TokenState][] = states.map(s => [s.table, s]);
	return new Map(pairs);
}


function TMP_bitmapIncluded(subset: PlayerCardState, superset: PlayerCardState): boolean {
	for (let i = 0; i < subset.bitmap.length; i++)
		if (subset.bitmap[i] && !superset.bitmap[i]) return false;
	return true;
}



// CAREFUL: small takes not needed in 1 player search. In real game will be needed when larger are not available
const ENABLE_SMALL_TAKES = false;//true;


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
	
	isPlayerSubsetOf(other: TokenState): boolean {
		return enoughStates(other.player, this.player);
	}
	
}


export class PlayerCardState {
	bitmap: boolean[] = '0'.repeat(91).split('').map(_ => false);

		vec: number[] = [0, 0, 0, 0, 0, 0]; // 0:4 - num cards per color, [5] - points

	copy(): PlayerCardState {
		let res = new PlayerCardState();
		res.bitmap = structuredClone(this.bitmap);
			res.vec = structuredClone(this.vec);
		return res;		
	}

	
	numOwned(): number {
		return this.vec.slice(0, 5).reduce((a,b)=>a+b, 0);
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
	
	isSubsetOf(other: PlayerCardState): boolean {
		return TMP_bitmapIncluded(this, other);
	}
	
}


export class TableCardState {
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



	export const MAX_PLAYER_TOKS = 10;


	export type Card = number;

	export function numStringD(c: number): string { return (c + 100).toString(10).substring(1,3); }
	export function numStringH(c: number): string { return (c + 256).toString(16).substring(1,3); }
	export function cardStringD(c: Card): string { return (c + 100).toString(10).substring(1,3); }
	export function cardStringH(c: Card): string { return (c + 256).toString(16).substring(1,3); }

	export function getVectorsSum1(): string[] { return STR_1x1.map(s => s + "0"); }
	export function getVectorsSum2(): string[] { return STR_2x1.concat(STR_1x2).map(s => s + "0"); }

		// Make all token vectors that player can have
		export function genVectors(max: number): TokenVec[] {
			let vecs: TokenVec[] = [];
			for (let n = 0; n < 100_000; n++) {
				const s = (100_000 + n).toString(10).substring(1) + '0';
				if (!s.split('').some(s => parseInt(s, 10) > max)) vecs.push(new TokenVec(s));
			}
			
			return vecs.filter(x => x.sum() <= MAX_PLAYER_TOKS);
		}


	type StringBinFunc = (x: number, y: number) => number;


	function incStr(a: string, ind: number): string {
		const aLen = a.length;
		const res = a.split('');
		
		for (let i = 0; i < aLen; i++) {
			if (ind == i) {
				//let val = parseInt(a[i], 16) + 1;
				//res[i] = val.toString(16);
				
				const val = a.charCodeAt(i);
				res[i] = String.fromCharCode(val+1);
			}
			else
				res[i] = a[i];
		}
		return res.join('');
	}	


	function stringBinOp(func: StringBinFunc, a: string, b: string): string {
		const aLen = a.length;
		const res = a.split('');
		
		for (let i = 0; i < aLen; i++) {
			const val = func(parseInt(a[i], 16), parseInt(b[i], 16));
			res[i] = val.toString(16);
		}
		return res.join('');
	}		
	
	
	export class TokenVec {
		readonly str: string;
		
		constructor(s: string) {
			// TODO: check correctness
			this.str = s;
		}
		
		excessive(): boolean { return this.sum() > MAX_PLAYER_TOKS; }
		
		toLongString(): string { return '[' + this.sum().toString(16) + ']' + this.str; }
		
		incAt(i: number): TokenVec {
			return new TokenVec(incStr(this.str, i));
		}
		
		sum(): number {
			let res = 0;
			for (const c of this.str) res += parseInt(c, 16);
			return res;
		}
		
			compare(other: TokenVec): number {
				const thisSum = this.sum();
				const otherSum = other.sum();
				
				if (thisSum != otherSum) return thisSum - otherSum;
				else return (this.str).localeCompare(other.str);
			}
		
		add(other: TokenVec): TokenVec { return new TokenVec(stringBinOp((x,y) => x+y, this.str, other.str)); }
		sub(other: TokenVec): TokenVec { return new TokenVec(stringBinOp((x,y) => x-y, this.str, other.str)); }
		elemMax(other: TokenVec): TokenVec { return new TokenVec(stringBinOp(Math.max, this.str, other.str)); }
		elemMin(other: TokenVec): TokenVec { return new TokenVec(stringBinOp(Math.min, this.str, other.str)); }
		
		atLeast(other: TokenVec): boolean {
			for (let i = 0; i < this.str.length; i++) {
				if (parseInt(this.str[i], 16) < parseInt(other.str[i], 16)) return false;
			}
			return true;
		}

		// If greater than other: any element greater than corresponding, others not smaller
		covers(other: TokenVec): boolean {
			let hasGreater = false;
			for (let i = 0; i < this.str.length; i++) {
				if (parseInt(this.str[i], 16) < parseInt(other.str[i], 16)) return false;
				else if (parseInt(this.str[i], 16) > parseInt(other.str[i], 16)) hasGreater = true;
			}
			return hasGreater;
		}
		
		enoughForTake(other: TokenVec): boolean {
			for (let i = 0; i < this.str.length; i++) {
				if (parseInt(this.str[i], 16) < parseInt(other.str[i], 16)) return false;
				if (parseInt(this.str[i], 16) < 4 && parseInt(other.str[i], 16) > 1) return false;
			}
			return true;
		}
	
	}
