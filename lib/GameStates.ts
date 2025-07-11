
import {getCardPrice, getCardPoints,} from './searching_base.ts';


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

const STR_RET3 = STR_3x1.concat(STR_1x2_1x1).concat(STR_1x3);
const STR_RET2 = STR_2x1.concat(STR_1x2);
const STR_RET1 = STR_1x1;


function sortRows(arr: number[]): number[] {
	const unsorted = [arr.slice(0, 4), arr.slice(4, 8), arr.slice(8, 12)];
		//console.log(unsorted);
	const sorted = unsorted.map(x => x.toSorted((a,b) => a-b));
		//console.log(sorted);
	return sorted.flat();
}


export namespace GameStates {
	// For now we assume 2 players, so 44444 token stacks
	export const MAX_TOKEN_STACKS = "444440";
									"555550";
									"777770";
	export const MAX_PLAYER_TOKS = 10;


	const N_PLAYERS = 2;

	
	type StringBinFunc = (x: number, y: number) => number;
	
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
		
		excessive(): boolean {
			return this.sum() > MAX_PLAYER_TOKS;
		}
		
		toLongString(): string {
			return ' (' + this.sum().toString(16) + ')' + this.str;
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
		
		add(other: TokenVec): TokenVec {
			return new TokenVec(stringBinOp((x,y) => x+y, this.str, other.str));
		}

		sub(other: TokenVec): TokenVec {
			return new TokenVec(stringBinOp((x,y) => x-y, this.str, other.str));
		}

		elemMax(other: TokenVec): TokenVec {
			return new TokenVec(stringBinOp(Math.max, this.str, other.str));
		}

		elemMin(other: TokenVec): TokenVec {
			return new TokenVec(stringBinOp(Math.min, this.str, other.str));
		}
		
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



	export function getVectorsSum1(): string[] {
		return STR_1x1.map(s => s + "0");
	}

	export function getVectorsSum2(): string[] {
		return STR_2x1.concat(STR_1x2).map(s => s + "0");
	}


	export class TokenState {
		readonly tableToks: TokenVec;
		readonly playerToks: TokenVec[];
		
		constructor(t: TokenVec, p: TokenVec[]) {
			this.tableToks = t;
			this.playerToks = p;	
		}
		
		compare(other: TokenState): number {
			const cmpT = this.tableToks.compare(other.tableToks);
			if (cmpT != 0) return cmpT;
			
			for (let i = 0; i < this.playerToks.length; i++) {
				const cmpP = this.playerToks[i]!.compare(other.playerToks[i]!);
				if (cmpP != 0) return cmpP;
			}
			return 0;
		}
		
		toString(): string {
			return `   ${this.tableToks.str} ;  ` +  this.playerToks.map(x => x.str).join(' | ');
		}
		
		toLongString(): string {
			return this.tableToks.toLongString() + this.playerToks.map(x => x.toLongString()).join('');
		}
		
		keyString(): string {
			return this.tableToks.str + this.playerToks.map(x => x.str).join('');
		}
		
		playerString(): string {
			return this.playerToks.map(x => `(${x.sum().toString(16)})` + x.str).join('|');
		}
		
		static fromKeyString(s: string): TokenState {
			const sixes = s.match(/....../g)!;
			const tv = sixes.map(x => new TokenVec(x));
				return new TokenState(tv[0]!, tv.slice(1));
		}
		
		ofPlayer(player: number): TokenVec {
			return this.playerToks[player]!;
		}
		
		findPossibleTakes(): string[] {
			const tableToks = this.tableToks;
			const takes23 = STR_3x1.concat(STR_1x2).map(s => s + "0");
			let goodTakes = takes23.filter(s => tableToks.enoughForTake(new TokenVec(s)));

			if (goodTakes.length == 0) goodTakes = STR_2x1.map(s => s + "0").filter(s => tableToks.enoughForTake(new TokenVec(s)));
			if (goodTakes.length == 0) goodTakes = STR_1x1.map(s => s + "0").filter(s => tableToks.enoughForTake(new TokenVec(s)));
			if (goodTakes.length == 0) goodTakes = ["000000"];
			
			return goodTakes;
		}


		findReductions(player: number): string[] {
			const playerToks = this.ofPlayer(player);
			const surplus = playerToks.sum() - MAX_PLAYER_TOKS;
			if (surplus > 3 || surplus < 1) throw new Error("Wrong, over 3 too much or not too much");
			
			const giveString = (surplus == 3) ? STR_RET3 : (surplus == 2) ? STR_RET2 : STR_RET1;
			const gives = giveString.map(s => s + "0");
			let res = gives.filter(s => playerToks.atLeast(new TokenVec(s)));

			return res;
		}

		
		applyTake(player: number, move: TokenVec): TokenState {
			const tableToks = this.tableToks;
			const playerToks = this.ofPlayer(player);
			
			const newPT = playerToks.add(move);
			const newTT = tableToks.sub(move);
			return new TokenState(newTT, this.playerToks.with(player, newPT));
		}

		applyTakes(player: number, moves: string[]): TokenState[] {
			const newStates = moves.map(s => this.applyTake(player, new TokenVec(s)));
			return newStates;
		}


		// Only changes the player toks, not affecting table
		applyDelta(player: number, move: TokenVec): TokenState {
			const playerToks = this.ofPlayer(player);
			
			const newPT = playerToks.add(move);
			return new TokenState(this.tableToks, this.playerToks.with(player, newPT));
		}

		applyDeltas(player: number, moves: string[]): TokenState[] {
			const newStates = moves.map(s => this.applyDelta(player, new TokenVec(s)));
			return newStates;
		}

		applyGive(player: number, move: TokenVec): TokenState {
			const tableToks = this.tableToks;
			const playerToks = this.ofPlayer(player);
			
			const newPT = playerToks.sub(move);
			const newTT = tableToks.add(move);
			return new TokenState(newTT, this.playerToks.with(player, newPT));
		}

		applyGives(player: number, moves: string[]): TokenState[] {
			return moves.map(s => this.applyGive(player, new TokenVec(s)));
		}

	};
	


	function handleExcessive(states: TokenState[], player: number): TokenState[] {
		let arr: TokenState[] = [];
		let arrArr: TokenState[][] = [];
		
		states.forEach(x => {
			if (x.ofPlayer(player).excessive()) {					
				const gives = x.findReductions(player);
				const y = x.applyGives(player, gives);
				arrArr.push(y);
			}
			else {
				arrArr.push([x]);
			}
		});
		
		return arrArr.flat();
	}


		class PruningResult {
			res: TokenState[] = [];
			copied: TokenState[] = [];
			counts: number[] = [];
			totalCount = 0;
		};

		// Naive implementation - compare each state to previous states (assumes sorted by falling sum!)
		function pruneInternal(statesCopy: TokenState[], player: number): PruningResult {
			let pruningResult = new PruningResult();
			
			while (statesCopy.length > 0) {
				const last = statesCopy.pop()!;
				let found = false;
				let thisCount = 0;
				
				// WARNING: This algorithm only looks at given player's tokens. Opponent having more or less is not checked
				for (const st of statesCopy) {
					if (st.ofPlayer(player).sum() <= last.ofPlayer(player).sum()) break;
					
					thisCount++;
					
					if (st.ofPlayer(player).covers(last.ofPlayer(player))) {
						found = true;
						break;
					}
				}
				
				pruningResult.totalCount += thisCount;
				
				if (!found) {
					pruningResult.res.push(last);
					thisCount = -1;
				}
				pruningResult.copied.push(last);
				pruningResult.counts.push(thisCount);
			}
			return pruningResult;
		}
		
		type PruningFunction = typeof pruneInternal;


		function pruneInternal_Ex0(statesCopy: TokenState[], player: number): PruningResult {
			const MAX_SUM = statesCopy[0]!.ofPlayer(player).sum();
			const MIN_SUM = statesCopy[0]!.ofPlayer(player).sum();
			
			if (MAX_SUM - MIN_SUM > 2) throw new Error("Sum span for player is over 2!");
			
			let pruningResult = new PruningResult();
			
			const grouped = Map.groupBy(statesCopy, x => x.ofPlayer(player).str);

			while (statesCopy.length > 0) {
				const last = statesCopy.pop()!;
				let found = false;
				let foundUp1 = false;
				let foundUp2 = false;
				let thisCount = 0;
				let thisCountUp1 = 0;
				let thisCountUp2 = 0;
				
				const thisSum = last.ofPlayer(player).sum();
				
				if (thisSum < MAX_PLAYER_TOKS)
				{
					// Generate all possible player token vecs larger by 1 or 2 than current one 
					const add1 = getVectorsSum1();
					const add2 = getVectorsSum2();
					
					const up1 = last.applyDeltas(player, add1);
					const up2 = last.applyDeltas(player, add2);

					for (const s of up1) {
						thisCountUp1++;
						if (grouped.has(s.ofPlayer(player).str)) {
							foundUp1 = true;
							break;
						}
					}
					
					//if (thisSum < MAX_PLAYER_TOKS - 1)					
						for (const s of up2) {
							thisCountUp2++;
							if (grouped.has(s.ofPlayer(player).str)) {
								foundUp2 = true;
								break;
							}
						}
				}
				
				found = foundUp1 || foundUp2;
				thisCount = thisCountUp1 + thisCountUp2;

				pruningResult.totalCount += thisCount;
				
				if (found && !foundUp1 && !foundUp2) throw new Error("Wrong finings");
				
				if (!found) {
					if (foundUp1 || foundUp2) throw new Error("Other wrong finings");
					
					pruningResult.res.push(last);
					thisCount = -1;
				}
				pruningResult.copied.push(last);
				pruningResult.counts.push(thisCount);
			}
			return pruningResult;
		}

	
	function uniqueTokStates(states: TokenState[]): TokenState[] {
		const uniqueSet = new Set(states.map(x => x.keyString()));
		return uniqueSet.values().toArray().map(TokenState.fromKeyString);
	}

	function fixExcessiveStates(inputStates: TokenState[][], player: number): TokenState[][] {
		let res: TokenState[][] = [];
		
		inputStates.forEach(x => {
			const y = handleExcessive(x, player);
			res.push(y);
		});
		
		return res;
	}


	export class TokenStateSet {
		private states: TokenState[] = [];
		
		size(): number {
			return this.states.length;
		}
		
		static fromArray(sa: TokenState[]) {
			let res = new TokenStateSet();
			res.states = [...sa];//sa.map(x => x);
			res.makeUnique();
			return res;
		}
		
		makeUnique(): void {
			this.states = uniqueTokStates(this.states);
		}


		// Print formatted content
		organize(): void {
			const grouped = Map.groupBy(this.states, x => x.tableToks.str);
			
			console.log(`${this.size()} states:`);
			for (let [tableStr, pl] of grouped) {
				console.log(`[${pl.length}] ${tableStr} => ` + pl.map(x => x.playerString()).join(', '))
			}
		}

		showSplit(player: number): void {
			const grouped = Map.groupBy(this.states, x => x.ofPlayer(player).sum());
			let str = "";
			for (const [num, list] of grouped)
				str += `${num} => ${list.length}, `;
			console.log(str);
		}

		
		// Apply takes to each state
		generateNewStates(player: number): TokenState[][] {
			let res: TokenState[][] = [];

			this.states.forEach(x => {
				const moves = x.findPossibleTakes();
				const y = x.applyTakes(player, moves);				
				res.push(y);
			});
			
			return res;
		}

		
		// For every state in set, make all possible takes
		applyNewTakes(player: number): TokenStateSet {
			console.time('takes A_1');
			
			const fwStates = this.generateNewStates(player);
			const fwFlat = fwStates.flat();

			const sizeGenerated = fwFlat.length;
				
			const fwUnique = [uniqueTokStates(fwFlat)];

			console.timeEnd('takes A_1');


			console.time('takes A_2');
			const newStates = fixExcessiveStates(fwUnique, player);
			console.timeEnd('takes A_2');

			console.time('takes B');
			
			const newStatesFlat = newStates[0]!

			let newStatesAdjustedUnique = uniqueTokStates(newStatesFlat);
											
			newStatesAdjustedUnique.sort((a, b) => b.ofPlayer(player).sum() - a.ofPlayer(player).sum());
			
			const res = TokenStateSet.fromArray(newStatesAdjustedUnique);

			console.timeEnd('takes B');
			
			console.log(`New states: ${this.size()} -> (${sizeGenerated}) -> (${newStatesFlat.length}) -> ${newStatesAdjustedUnique.length} ` +
						`// avg (${sizeGenerated/this.size()}) -> (${newStatesFlat.length/this.size()}) -> ${newStatesAdjustedUnique.length/this.size()}`);

			return res;
		}
		
		
		// Remove non-optimal states for given player
		__prune(player: number, func: PruningFunction, write: boolean, fname: string): void {		
			console.log('prune for player ' + player);
			
			console.time('prune');
			const statesCopy = [...this.states];
			
			// Don't sort, must be already sorted!
			//statesCopy.sort((a, b) => b.playerToks[player]!.sum() - a.playerToks[player]!.sum());
			
			let pruningResult = func(statesCopy, player);
			
			console.timeEnd('prune');
			console.log(`Pruned: ${this.size()} -> ` + pruningResult.res.length + 
							` // all ${pruningResult.totalCount}, avg ${pruningResult.totalCount / (this.size())}`);

			pruningResult.res.sort((a, b) => b.ofPlayer(player).sum() - a.ofPlayer(player).sum());

			this.showSplit(player);
			this.states = pruningResult.res;
			this.showSplit(player);

			if (write) writePruning(fname, pruningResult.copied, player, pruningResult.counts);	
		}
		
	}

	
	export type Card = number;

	function numStringD(c: number): string {
		return (c + 100).toString(10).substring(1,3);
	}

	function numStringH(c: number): string {
		return (c + 256).toString(16).substring(1,3);
	}

	function cardStringD(c: Card): string {
		return (c + 100).toString(10).substring(1,3);
	}

	function cardStringH(c: Card): string {
		return (c + 256).toString(16).substring(1,3);
	}


	export class PlayerCards {
		readonly bonuses: TokenVec;
		readonly points: number;
		readonly reserved: Card[];
		
		constructor(b: TokenVec, p: number, r: Card[]) {
			this.bonuses = b;
			this.points = p;
			this.reserved = r;
		}
		
		str(): string {
			return this.bonuses.str + ';' + this.points.toString(10) + ';' + this.reserved.map(cardStringD);
		}

		keyString(): string {
			return numStringH(this.points) + this.bonuses.str;
		}
		
		niceString(): string {
			return `(${numStringD(this.points)}) ${this.bonuses.str} []`;
		}
		
		static fromKeyString(s: string): PlayerCards {
			return new PlayerCards(new TokenVec(s.substring(2, 8)), parseInt(s.substring(0, 2), 16), []); 
		}

		
		covers(other: PlayerCards): boolean {
			return false//(this.points >= other.points && this.bonuses.covers(other.bonuses))
				|| (this.points > other.points && this.bonuses.str == (other.bonuses.str));
		}

		acquire(c: Card): PlayerCards {
			const ind = c % 5;
			const strBase = ["100000", "010000", "001000", "000100", "000010",];
			const increment = strBase[ind]!;
			
			const newBonuses = this.bonuses.add(new TokenVec(increment));
			const newPoints = this.points + getCardPoints(c);

			return new PlayerCards(newBonuses, newPoints, this.reserved);
		}
		
	}
	
	const DEFAULT_PLAYER_CARDS = new PlayerCards(new TokenVec("000000"), 0, []);
	
	export class TableCards {
		readonly stackNums: number[];
		readonly spread: Card[]; // Cards seen on table
		
		constructor(sn: number[], sp: Card[]) {
			this.stackNums = sn;
			this.spread = sp;
		}
		
		str(): string {
			const cardStr = this.spread.map(cardStringD).join(',');
			return this.stackNums.map(numStringD).join(',') + ';' + cardStr;
		}

		keyString(): string {
			const stackStr = this.stackNums.map(numStringH).join('');
			const spreadStr = this.spread.map(cardStringH).join('');
			return stackStr + spreadStr;
		}

		niceString(): string {
			return `${this.stackNums} [` + this.spread.map(cardStringD).join(',') + ']';
		}

		static fromKeyString(s: string): TableCards {
			const twos = s.match(/../g)!;
			const nums = twos.slice(0, 3).map(x => parseInt(x, 16));
			const spread = twos.slice(3).map(x => parseInt(x, 16) as Card);
			
			return new TableCards(nums, spread);
		}
	
		grab(c: Card): TableCards {
			const index = this.spread.indexOf(c);
			
			if (index == -1) throw new Error("Card not on table");
			
			const row = Math.floor(index/4);
			const stackSize = this.stackNums[row]!;
			
			const newCard = TABLE_STACKS[row]![stackSize-1]!;
			
			
			const newStackNums = this.stackNums.toSpliced(row, 1, stackSize-1);

			const newSpread = sortRows(this.spread.toSpliced(index, 1, newCard));
			
			
			return new TableCards(newStackNums, newSpread);
		}
		
	}
	
	const DEFAULT_TABLE_CARDS = new TableCards([36, 26, 16], INITIAL_TABLE_NUMS.flat());

	export class CardState {
		readonly tableCards: TableCards;
		readonly playerCards: PlayerCards[];
		
		constructor(t: TableCards, p: PlayerCards[]) {
			this.tableCards = t;
			this.playerCards = p;
		}
		
		str(): string {
			return this.tableCards.str() + '\n    ' + this.playerCards.map(x => x.str() + '||');
		}

		keyString(): string {
			return this.tableCards.keyString() + this.playerCards.map(x => x.keyString()).join('');
		}
		
		niceString(): string {
			return this.tableCards.niceString() + '  ' + this.playerCards.map(x => x.niceString()).join('  ');
		}
		
		
		static fromKeyString(s: string): CardState {
			const tableCards = TableCards.fromKeyString(s.slice(0,30));
			const eights = s.substring(30).match(/......../g)!;
			const playerCards = eights.map(PlayerCards.fromKeyString);
			return new CardState(tableCards, playerCards);
		}

		ofPlayer(player: number): PlayerCards {
			return this.playerCards[player]!;
		}

		steal(player: number, c: Card): CardState {
			const newPlayerCards = [...this.playerCards];
			newPlayerCards[player]! = newPlayerCards[player]!.acquire(c);
			return new CardState(this.tableCards.grab(c), newPlayerCards);
		}
		
		genNext(player: number): CardState[] {
			return this.tableCards.spread.map(c => this.steal(player, c));
		}

		addNext(player: number): CardState[] {
			const thisArr: CardState[] = [this];
			return thisArr.concat(this.genNext(player));
		}

	}
	
	
	export function uniqueCardStates(states: CardState[]): CardState[] {
		const uniqueSet = new Set(states.map(x => x.keyString()));
		return uniqueSet.values().toArray().map(CardState.fromKeyString);
	}
	
	
	export function moveCards(states: CardState[], player: number): CardState[] {
		return states.map(x => x.addNext(player)).flat();
	}

	// This function rejects states which have less points than other state AND the same vector of bonuses
	export function pruneCards(states: CardState[], player: number): CardState[] {
		//if (states.length > 200) return [];
		
		const statesCopy = [...states];
		statesCopy.sort((a, b) => b.ofPlayer(player).bonuses.sum() - a.ofPlayer(player).bonuses.sum());

		let res: CardState[] = [];
		
		while(statesCopy.length > 0) {
			const last = statesCopy.pop()!;
			let found = false;
			
			// Temporary, to reduce analyzed tree size: reject if too big disadvantage in points
			const allPoints = last.playerCards.map(x => x.points);
			const myPoints = last.ofPlayer(player).points;
			
			// if (allPoints.some(x => x > (myPoints + 5)))
				// found = true;
			// else
				for (const st of statesCopy) {
					if (st.ofPlayer(player).covers(last.ofPlayer(player))) {
						found = true;
							//console.log(`Kill ${st.niceString()} by ${last.niceString()}`);
						break;
					}
				}
			
			if (!found) {
				res.push(last);
			}
		}
		
		return res; 
	}	


	export class TableCardsConcise {
		stackImg: string = ""; // Begins with sum of stacks so that sorting is done first with regard to total cards remaining
		rowImg0: string = "";
		rowImg1: string = "";
		rowImg2: string = "";
		
		toString(): string {
			return [this.stackImg, this.rowImg0, this.rowImg1, this.rowImg2, ].join(' ');
		}
		
		static fromCardState(st: CardState): TableCardsConcise {
			let cc = new TableCardsConcise();
			cc.stackImg = [st.tableCards.stackNums[0]! + st.tableCards.stackNums[1]! + st.tableCards.stackNums[2]!,
							st.tableCards.stackNums[0]!, st.tableCards.stackNums[1]!, st.tableCards.stackNums[2]!].map(numStringH).join('');
			cc.rowImg0 = st.tableCards.spread.slice(0, 4).map(cardStringH).join('');
			cc.rowImg1 = st.tableCards.spread.slice(4, 8).map(cardStringH).join('');
			cc.rowImg2 = st.tableCards.spread.slice(8, 12).map(cardStringH).join('');
			return cc;
		}
	}


	function TMP_compareCardStates(a: CardState, b: CardStates, player: number): number {
		const cmpTable = TableCardsConcise.fromCardState(a).stackImg.localeCompare(TableCardsConcise.fromCardState(b).stackImg);
		
		if (cmpTable != 0) return cmpTable;

		//return a.ofPlayer(player).compare()
		
	}


	export function TMP_sortCardStates(states: CardState[], player: number): CardState[] {
		const statesCopy = [...states];
		
		statesCopy.sort( (a, b) => TableCardsConcise.fromCardState(a).stackImg.localeCompare(TableCardsConcise.fromCardState(b).stackImg) );
		
		return statesCopy;
	}


	export const DEFAULT_CARDS = new CardState(
										DEFAULT_TABLE_CARDS, 
										[DEFAULT_PLAYER_CARDS, DEFAULT_PLAYER_CARDS, DEFAULT_PLAYER_CARDS, DEFAULT_PLAYER_CARDS,].slice(0, N_PLAYERS)
										);
	
	
	export class State {
		readonly cardState: CardState;
		readonly tokenState: TokenState;
		
		constructor(c: CardState, t: TokenState) {
			this.cardState = c;
			this.tokenState = t;
		}
		
		tokenStr(): string {
			return this.tokenState.toString();
		}
	}



	
	export class StateSet {
		states: State[] = [];
		
		addState(s: State): void {
		}
		
		addStates(sa: State[]): void {
		}
	}
	
	
	// Experimental, for tokens only
	export class Wavefront0 {
		readonly nPlayers = N_PLAYERS;
		round = 0;     // Round that lasts until all players make move 
		playerTurn = 0; // Player to move next
		states: State[] = [INITIAL_STATE];
		__tokStates = TokenStateSet.fromArray([INITIAL_STATE.tokenState]);

		move(): void {
			console.log(`{${this.round},${this.playerTurn}}`);

			this.__tokStates = this.__tokStates.applyNewTakes(this.playerTurn);
			this.__tokStates.__prune(this.playerTurn, pruneInternal_Ex0, //this.round == 2 && this.playerTurn == 0, "pruned_full_2_0_Ex0");
																		 false, "");
			this.playerTurn++;
			if (this.playerTurn == this.nPlayers) {
				this.playerTurn = 0;
				this.round++;
			}
		}
		
		
			__playerMove(): void {
				const tokState = this.states[0]!.tokenState;
				const goodTakes = tokState.findPossibleTakes();
							
				// Choose random move of those possible
				const chosenInd = Math.round(Math.random() * 1000000) % goodTakes.length;
				const move = new TokenVec(goodTakes[chosenInd]!);
				const newTS = tokState.applyTake(this.playerTurn, move);

				console.log("   choose " + goodTakes[chosenInd]);// + " -> " + 
				this.states[0] = new State(this.states[0]!.cardState, newTS);
			}
		
	}


	// Experimental, for cards only
	export class Wavefront1 {
		readonly nPlayers = N_PLAYERS;
		round = 0;     // Round that lasts until all players make move 
		playerTurn = 0; // Player to move next
		__cardStates: CardState[] = [DEFAULT_CARDS];

		move(): void {
			console.log(`{${this.round},${this.playerTurn}}`);

			this.__cardStates = moveCards(this.__cardStates, this.playerTurn);
			const prevSize = this.__cardStates.length;
			this.__cardStates = uniqueCardStates(this.__cardStates);
			
				const sortedStates = TMP_sortCardStates(this.__cardStates, this.playerTurn);
			
				 TMP_logCardStates(sortedStates, `cards_${this.round}_${this.playerTurn}.txt`);
				 TMP_logConciseCardStates(sortedStates.map(TableCardsConcise.fromCardState), `concise_${this.round}_${this.playerTurn}.txt`);
			
			const pruned = pruneCards(this.__cardStates, this.playerTurn);
			
			console.log(`Unique card states: ${prevSize} -> ${this.__cardStates.length}`);
			console.log(`Pruned size ${pruned.length}`);

				this.__cardStates = pruned;

			this.playerTurn++;
			if (this.playerTurn == this.nPlayers) {
				this.playerTurn = 0;
				this.round++;
			}
		}
		
	}

	
	export const INITIAL_STATE = new State(
		// new CardState(
			// new TableCards(),
			// [new PlayerCards, new PlayerCards, new PlayerCards, new PlayerCards].slice(0, N_PLAYERS)
		// ),
		DEFAULT_CARDS,
		new TokenState(
			new TokenVec(MAX_TOKEN_STACKS),
			[new TokenVec("000000"), new TokenVec("000000"), new TokenVec("000000"), new TokenVec("000000")].slice(0, N_PLAYERS)
		)
	);


		export function genVectors(max: number): TokenVec[] {
			let vecs: TokenVec[] = [];
			for (let n = 0; n < 100_000; n++) {
				const s = (100_000 + n).toString(10).substring(1) + '0';
				if (!s.split('').some(s => parseInt(s, 10) > max)) vecs.push(new TokenVec(s));
			}
			
			return vecs.filter(x => x.sum() <= MAX_PLAYER_TOKS);
		}
		
		export function showVecs(vecs: TokenVec[]): void {
			console.log(vecs.map(x => x.str).join('  '));
		}
	

	function writePruning(fname: string, states: TokenState[], player: number, counts: number[]): void { 
		const fs = require("fs");
		const writer = fs.createWriteStream(fname);
		const LEN = states.length;
		for (let i = 0; i < states.length; i++) {
			const thisCount = counts[i]!;
			const killer = thisCount == -1 ? "" : states[LEN-thisCount]!.toLongString();
			writer.write(`${i}: ${states[i]!.toLongString()}, ${thisCount}: ${killer}\n`);
		}
		
		writer.end();
	}
	
	
	
	function TMP_logCardStates(states: CardState[], fname: string): void {
		const fs = require("fs");
		const writer = fs.createWriteStream(fname);
		const LEN = states.length;
		for (let i = 0; i < states.length; i++) {
			const state = states[i]!;
			
			const desc = `M=${Math.max(state.ofPlayer(0).points,state.ofPlayer(1).points)}, D=${state.ofPlayer(0).points - state.ofPlayer(1).points}`;
			
			writer.write(`${i}: ${state.niceString()}   |  ${TableCardsConcise.fromCardState(state).toString()} || ${desc}\n`);
		}
		
		writer.end();
	}

		function TMP_logConciseCardStates(states: TableCardsConcise[], fname: string): void {
			const fs = require("fs");
			const writer = fs.createWriteStream(fname);
			const LEN = states.length;
			for (let i = 0; i < states.length; i++) {
				const state = states[i]!;
				
				//const desc = `M=${Math.max(state.ofPlayer(0).points,state.ofPlayer(1).points)}, D=${state.ofPlayer(0).points - state.ofPlayer(1).points}`;
				
				writer.write(`${i}: ${state.toString()}\n`);
			}
			
			writer.end();
		}
	
}
