
import {cardStringList, CARD_SPECS, getCardPrice, getCardPoints, TokenVec, MAX_PLAYER_TOKS, 	Card,
	sortRows,
	STR_1x1, STR_2x1, STR_1x2, STR_1x3, STR_1x2_1x1, STR_3x1, STR_RET3, STR_RET2, STR_RET1,

	numStringD,
	numStringH,
	cardStringD,
	cardStringH,
	getVectorsSum1,
	getVectorsSum2,
	}
from './searching_base.ts';


// CAREFUL: inverted wrt tables in basic definitions
const TABLE_STACKS: number[][] =
[
  [
     3, 10,  5, 11, 17, 7, 19,
    15, 16,  1, 18,  9, 6, 14,
    12,  4, 20,  2, 13, 8
  ],
  [
    27, 25, 29, 38, 36, 35, 22, 45, 41,
    37, 40, 34, 47, 49, 26, 50, 46, 33,
    43, 32, 21, 42, 28, 23, 30, 48, 31,
    39, 44, 24
  ],
  [ // lowest cards
    62, 65, 51, 82, 74, 63, 64, 56, 69, 81,
    55, 54, 73, 71, 57, 79, 76, 70, 85, 89,
    78, 68, 72, 58, 59, 66, 77, 86, 87, 60,
    61, 52, 84, 90, 83, 80, 75, 88, 67, 53
  ],

];

const INITIAL_STACK_SIZES = [16, 26, 36];

const INITIAL_TABLE_NUMS: number[][] =
		[ [ 2,  8, 13, 20],
		  [24, 31, 39, 44], 
		  [53, 67, 75, 88] ];




export namespace GameStates {
	// For now we assume 2 players, so 44444 token stacks
	export const MAX_TOKEN_STACKS = "444440";
									"555550";
									"777770";
	const N_PLAYERS = 2;

	interface StateValue<T> {
		keyString(): string;
		niceString(): string;
		isSame(other: T): boolean;
	}

	export class TokenState implements StateValue<TokenState> {
		readonly tableToks: TokenVec;
		readonly playerToks: TokenVec[];
		
		constructor(t: TokenVec, p: TokenVec[]) {
			this.tableToks = t;
			this.playerToks = p;	
		}

		keyString(): string { return this.tableToks.str + this.playerToks.map(x => x.str).join(''); }	// TODO: remember to change later to prepend tok sum	
		niceString(): string { return this.tableToks.toLongString() + "|" + this.playerToks.map(x => x.toLongString()).join(','); }

		isSame(other: TokenState): boolean { throw new Error("not implemented"); }

		compare(other: TokenState): number {
			const cmpT = this.tableToks.compare(other.tableToks);
			if (cmpT != 0) return cmpT;
			
			for (let i = 0; i < this.playerToks.length; i++) {
				const cmpP = this.playerToks[i]!.compare(other.playerToks[i]!);
				if (cmpP != 0) return cmpP;
			}
			return 0;
		}

		playerString(): string { return this.playerToks.map(x => x.toLongString()).join('|'); }
			playerKString(): string { return this.playerToks.map(x => x.str).join(); }
		ofPlayer(player: number): TokenVec { return this.playerToks[player]!; }

		static fromKeyString(s: string): TokenState {
			const sixes = s.match(/....../g)!;
			const tv = sixes.map(x => new TokenVec(x));
			return new TokenState(tv[0]!, tv.slice(1));
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
			return gives.filter(s => playerToks.atLeast(new TokenVec(s)));
		}
		
		applyTake(player: number, move: TokenVec): TokenState {
			const playerToks = this.ofPlayer(player);			
			const newPT = playerToks.add(move);
			const newTT = this.tableToks.sub(move);
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

		applyDeltas(player: number, moves: string[]): TokenState[] { return moves.map(s => this.applyDelta(player, new TokenVec(s))); }

		applyGive(player: number, move: TokenVec): TokenState {
			const playerToks = this.ofPlayer(player);			
			const newPT = playerToks.sub(move);
			const newTT = this.tableToks.add(move);
			return new TokenState(newTT, this.playerToks.with(player, newPT));
		}

		applyGives(player: number, moves: string[]): TokenState[] {
			return moves.map(s => this.applyGive(player, new TokenVec(s)));
		}

	};
	
		
		const POINT_CHAR_OFFSET = 0; // To avoid some unlucky char which breaks conversion
	
		function encodeNum2(p: number) {
			//return numStringH(p);
			return String.fromCharCode(p + POINT_CHAR_OFFSET) + '\0';
		}			
	
		function decodeNum2(s: string): number {
			//return parseInt(s, 16);
			return s.charCodeAt(0) - POINT_CHAR_OFFSET;
		}


	export class PlayerCards implements StateValue<PlayerCards> {
		readonly bonuses: TokenVec;
		readonly points: number;
		readonly reserved: Card[];
		
		constructor(b: TokenVec, p: number, r: Card[]) {
			this.bonuses = b;
			this.points = p;
			this.reserved = r;
		}
		
		keyString(): string { 
		
		
		
				// const ks = `${encodeNum2(this.points)}${this.bonuses.str}`; 
				// const rec = PlayerCards.fromKeyString(ks);
				
				// if (!rec.isSame(this)) {
					// console.log(this);
					// console.log(rec);
					// console.log("||||||" + ks + "|||||");
					
					// throw new Error('f up');
				// }
				
				return `${encodeNum2(this.points)}${this.bonuses.str}` ; 
		
		
		}
		//keyString(): string { return String.fromCharCode(this.points) + "\0" + this.bonuses.str; }
		
		niceString(): string { return `(${numStringD(this.points)})${this.bonuses.toLongString()} []`; }

		isSame(other: PlayerCards): boolean {			
			return this.bonuses.str == other.bonuses.str && this.points == other.points; // TODO: reserved cards when become relevant
		}

		static fromKeyString(s: string): PlayerCards { 
			return new PlayerCards(new TokenVec(s.substring(2, 8)), decodeNum2(s.substring(0, 2)), []);
			//return new PlayerCards(new TokenVec(s.substring(2, 8)), s.charCodeAt(0), []);			
		}
		
		covers(other: PlayerCards): boolean {
			return false//(this.points >= other.points && this.bonuses.covers(other.bonuses))
				|| (this.points > other.points && this.bonuses.str == (other.bonuses.str));
		}

		acquire(c: Card): PlayerCards {
			const ind = (c-1) % 5;
				 //const strBase = ["100000", "010000", "001000", "000100", "000010",];
				//const increment = strBase[ind]!;
			
				// const newBonuses = this.bonuses.add(new TokenVec(increment));
				const newBonuses = this.bonuses.incAt(ind);
			
				//if (newBonuses_N.str != newBonuses.str) console.log("huuuuuuuu");
			
			const newPoints = this.points + getCardPoints(c);

			return new PlayerCards(newBonuses, newPoints, this.reserved);
		}
		
	}
	
	const DEFAULT_PLAYER_CARDS = new PlayerCards(new TokenVec("000000"), 0, []);


	export class ManyPlayerCards implements StateValue<ManyPlayerCards> {
		readonly arr: PlayerCards[];
		
		constructor(p: PlayerCards[]) {
			this.arr = p;
		}
		
		keyString(): string { 
		
		
			// const ks = this.arr.map(x => x.keyString()).join('');
			
			// const rec =  ManyPlayerCards.fromKeyString(ks);
			
			// if (!rec.isSame(this)) {
				
				// console.log(this.niceString());
				// console.log(rec.niceString());
				// console.log(ks);
				
				// console.log(this.ofPlayer(0).keyString());
				// console.log(PlayerCards.fromKeyString(this.ofPlayer(0).keyString()));
				// console.log(this.ofPlayer(1).keyString());
				// console.log(PlayerCards.fromKeyString(this.ofPlayer(1).keyString()));
				
				// throw new Error('wrong'); 
			
			// }
			
			return this.arr.map(x => x.keyString()).join(''); 
		
		
		}
		
		
		niceString(): string { return this.arr.map(x => x.niceString()).join('  '); }

		isSame(other: ManyPlayerCards): boolean {			
			for (let i = 0; i < this.arr.length; i++) {
				if (!this.ofPlayer(i).isSame(other.ofPlayer(i))) return false;
			}
			return true;
		}

		static fromKeyString(s: string): ManyPlayerCards {
			const PLEN = 8;
			
			if (s.length != N_PLAYERS * PLEN) throw new Error('not correct size');

			const parts: string[] = [];
			for (let i = 0; i < N_PLAYERS; i++) parts.push(s.substring(i*PLEN, i*PLEN + PLEN));
			
			const eights = parts;
			const playerCards = eights.map(PlayerCards.fromKeyString);
			return new ManyPlayerCards(playerCards);
		}

		playerKString(): string { return this.arr.map(x => x.keyString()).join(''); }

		ofPlayer(player: number): PlayerCards { return this.arr[player]!; }


		acquire(player: number, c: Card): ManyPlayerCards {
			const thisPlayer = this.ofPlayer(player);

			const ind = (c-1) % 5;

				 // const strBase = ["100000", "010000", "001000", "000100", "000010",];
				 // const increment = strBase[ind]!;
			
				 // const newBonuses = thisPlayer.bonuses.add(new TokenVec(increment));
				 const newBonuses_N = thisPlayer.bonuses.incAt(ind);
				
				//if (newBonuses_N.str != newBonuses.str) throw new Error(`not same ${newBonuses_N.str}: ${newBonuses.str}`);
				
				
			const newPoints = thisPlayer.points + getCardPoints(c);
			
			const thisPlayerNew = new PlayerCards(newBonuses_N, newPoints, thisPlayer.reserved);
			return new ManyPlayerCards(this.arr.with(player, thisPlayerNew));
		}
	}

	
	function sortSpread(copied: number[], index: number, card: Card): void {
		while (index < 11 && copied[index+1]! < card) {
			copied[index] = copied[index+1]!;
			index++;
		}
		
		while (index > 0 && copied[index-1]! > card) {
			copied[index] = copied[index-1]!;
			index--;
		}
		
		copied[index] = card;
	}
	


	export class TableCards implements StateValue<TableCards> {
		readonly stackNums: number[];
		readonly spread: Card[]; // Cards seen on table
		
		constructor(sn: number[], sp: Card[]) {
			this.stackNums = sn;
			this.spread = sp;
		}
		
		keyString(): string {			
			const stackStr: string = String.fromCharCode(...this.stackNums);
			const spreadStr: string = String.fromCharCode(...this.spread)!;
			
			return `${stackStr}${spreadStr}0`; // 3 (nums) + 12 (cards) + 1 ('0' to pad) = 16
		}

		niceString(): string { return `${this.stackNums} [` + this.spread.map(cardStringD).join(',') + ']'; }

		isSame(other: TableCards): boolean {			
			return this.stackNums.toString() == other.stackNums.toString() && this.spread.toString() == other.spread.toString();
		}


		static fromKeyString(s: string): TableCards {
			const nums = s.substring(0,3).split('').map(c => c.charCodeAt(0));
			const spread = s.substring(3,16).split('').map(c => c.charCodeAt(0));
		
			return new TableCards(nums, spread);
		}

		
		cardAt(index: number): Card {
			if (index < 0 || index > 11) throw new Error("Wrong index");
			return this.spread[index]!;
		}


		grabAt(index: number): TableCards {
			if (index < 0 || index > 11) throw new Error("Wrong index");
			
			const row = Math.floor(index/4);
			const col = Math.floor(index % 4);
			const stackSize = this.stackNums[row]!;
			
				const newCard = TABLE_STACKS[row]![stackSize-1]!;
				const newStackNums = this.stackNums.toSpliced(row, 1, stackSize-1);
					const newSpread = sortRows(this.spread.toSpliced(index, 1, newCard));
					//const newSpread = (this.spread.toSpliced(index, 1, newCard));
					//newSpread.sort((a,b) => a-b);

					const newSpread_N = [...this.spread];
					sortSpread(newSpread_N, index, newCard);


			return new TableCards(newStackNums, newSpread);
		}

		grab(c: Card): TableCards {
			const index = this.spread.indexOf(c);
			
			if (index == -1) throw new Error("Card not on table");
			
			return this.grabAt(index);		
		}
		
	}
	
	const DEFAULT_TABLE_CARDS = new TableCards(INITIAL_STACK_SIZES, INITIAL_TABLE_NUMS.flat());

	export class CardState implements StateValue<CardState> {
		readonly tableCards: TableCards;
		readonly mpc: ManyPlayerCards;
		
		constructor(t: TableCards, p: PlayerCards[]) {
			this.tableCards = t;
			this.mpc = new ManyPlayerCards(p);
		}
		
		keyString(): string { return this.tableCards.keyString() + this.mpc.keyString(); }
		niceString(): string { return this.tableCards.niceString() + this.mpc.niceString(); }

		isSame(other: CardState): boolean {			
			if (!this.tableCards.isSame(other.tableCards)) return false;
			return this.mpc.isSame(other.mpc);
		}

		static fromKeyString(s: string): CardState {
			const tableCards = TableCards.fromKeyString(s.slice(0,16)); // TODO: verify size
			//const eights = s.substring(30).match(/......../g)!; // TODO: size of slice should be: MAX_PLAYERS * 
			const playerCards = ManyPlayerCards.fromKeyString(s.substring(16)).arr;
			return new CardState(tableCards, playerCards);
		}

		playerKString(): string { return this.mpc.playerKString(); }

		ofPlayer(player: number): PlayerCards { return this.mpc.ofPlayer(player); }

		steal(player: number, c: Card): CardState {
			const newPlayerCards = [...this.mpc.arr];
			newPlayerCards[player]! = newPlayerCards[player]!.acquire(c);
			return new CardState(this.tableCards.grab(c), newPlayerCards);
		}
		
		genNext(player: number): CardState[] { return this.tableCards.spread.map(c => this.steal(player, c)); }

		addNext(player: number): CardState[] {
			const thisArr: CardState[] = [this];
			return thisArr.concat(this.genNext(player));
		}

	}


	function handleExcessive(states: TokenState[], player: number): TokenState[] {
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
		function pruneInternal_Default(statesCopy: TokenState[], player: number): PruningResult {
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
		
		type PruningFunction = typeof pruneInternal_Default;

		// For each state, generates states that are "bigger" by 1 or 2 and checks whether they are present
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
							const arr = grouped.get(s.ofPlayer(player).str)!;
							
							if (arr.some(x => x.playerKString() == s.playerKString())) foundUp1 = true;
							
							//	foundUp1 = true;
							break;
						}
					}
					
					//if (thisSum < MAX_PLAYER_TOKS - 1)					
						for (const s of up2) {
							thisCountUp2++;
							if (grouped.has(s.ofPlayer(player).str)) {
								const arr = grouped.get(s.ofPlayer(player).str)!;

								if (arr.some(x => x.playerKString() == s.playerKString())) foundUp2 = true;

								//	foundUp2 = true;
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
		
		size(): number { return this.states.length; }
		
		static fromArray(sa: TokenState[]) {
			let res = new TokenStateSet();
			res.states = [...sa];
			res.makeUnique();
			return res;
		}
		
		makeUnique(): void { this.states = uniqueTokStates(this.states); }

		showSplit(player: number): void {
			const grouped = Map.groupBy(this.states, x => x.ofPlayer(player).sum());
			let str = "";
			for (const [num, list] of grouped) str += `${num} => ${list.length}, `;
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


		export class TableCardsConcise {
			stackImg: string = ""; // Begins with sum of stacks so that sorting is done first with regard to total cards remaining
			rowImg0: string = "";
			rowImg1: string = "";
			rowImg2: string = "";
			
			toString(): string { return [this.stackImg, this.rowImg0, this.rowImg1, this.rowImg2, ].join(' '); }
			
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


	export const DEFAULT_CARDS = new CardState(
										DEFAULT_TABLE_CARDS, 
										[DEFAULT_PLAYER_CARDS, DEFAULT_PLAYER_CARDS, DEFAULT_PLAYER_CARDS, DEFAULT_PLAYER_CARDS,].slice(0, N_PLAYERS)
										);

		// Not used; replaced by CardStateBundledSet
		class CardStateSet {
			content = new Set<string>();
			
			size(): number {
				return this.content.size;
			}
			
			
			static init(cs: CardState[]): CardStateSet {
				const res = new CardStateSet();
				res.addStates(cs);
				return res;
			}
			
			clear(): void { 
				this.content.clear();
			}
			
			addStates(states: CardState[]): void {
				for (const st of states) this.content.add(st.keyString());
			}
			
			move(player: number): CardStateSet {
				const res = new CardStateSet();

				for (const s of this.content) {
					const sFull = CardState.fromKeyString(s);
					const next = sFull.addNext(player);
					res.addStates(next);
				}

				return res;
			}

		}



	export class State {
		readonly cardState: CardState;
		readonly tokenState: TokenState;
		
		constructor(c: CardState, t: TokenState) {
			this.cardState = c;
			this.tokenState = t;
		}
		
		tokenStr(): string { return this.tokenState.toString(); }
	}


	export class StateSet {
		states: State[] = [];
		
		addState(s: State): void {
		}
		
		addStates(sa: State[]): void {
		}
	}
	
	
	abstract class Wavefront {
		readonly nPlayers = N_PLAYERS;
		round = 0;     // Round that lasts until all players make move 
		playerTurn = 0; // Player to move next
		
		move(): void {
			this.moveImpl();

			this.playerTurn++;
			if (this.playerTurn == this.nPlayers) {
				this.playerTurn = 0;
				this.round++;
			}
		}
		
		abstract moveImpl(): void;
	}
	
	
	// Experimental, for tokens only
	export class WavefrontT extends Wavefront {
		states: State[] = [INITIAL_STATE];
		__tokStates = TokenStateSet.fromArray([INITIAL_STATE.tokenState]);

		moveImpl(): void {
			console.log(`{${this.round},${this.playerTurn}}`);

			this.__tokStates = this.__tokStates.applyNewTakes(this.playerTurn);
			this.__tokStates.__prune(this.playerTurn, pruneInternal_Ex0, //this.round == 2 && this.playerTurn == 0, "pruned_full_2_0_Ex0");
																		 false, "");

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




	//////////////////////////////////////////////////////////
	
	// Represents a set of states with shared TableCards
	class CardStateBundle {
		tableCards: TableCards = DEFAULT_TABLE_CARDS;
		pcSet = new Set<string>();
		
		size(): number {
			return this.pcSet.size;
		}
		
		static init(cs: CardState): CardStateBundle {
			const res = new CardStateBundle();
			res.tableCards = cs.tableCards;
			res.pcSet.add(cs.mpc.keyString());

			return res;			
		}

		addStates(states: ManyPlayerCards[]): void {
			for (const st of states) this.pcSet.add(st.keyString());
		}

		
		absorb(otherSet: Set<string>): void {
			for (const elem of otherSet)
				this.pcSet.add(elem);
		}
		

		merged(otherSet: Set<string>): CardStateBundle {
			const res = new CardStateBundle();
			res.tableCards = this.tableCards;
			res.pcSet = new Set<string>(this.pcSet);
			
			for (const elem of otherSet)
				res.pcSet.add(elem);
			
			return res;
		}

		move(player: number): CardStateBundle[] {
			const res: CardStateBundle[] = [this];
			
			for (const [ind, c] of this.tableCards.spread.entries()) {
				const nextTc = this.tableCards.grabAt(ind);
				const nextPcSet = this.pcSet.values().toArray().map(ManyPlayerCards.fromKeyString).map(x => x.acquire(player, c).keyString());
				
				const nextBundle = new CardStateBundle();
				nextBundle.tableCards = nextTc;
				nextBundle.pcSet = new Set<string>(nextPcSet);
				
				res.push(nextBundle);
			}
			
			return res;
		}
		
			shortInfo(): string {
				return this.tableCards.niceString() + `, set(${this.pcSet.size})`;
			}
		
	}


	class CardStateBundledSet {
		content = new Map<string, CardStateBundle>();
		
		numBundles(): number {
			return this.content.size;
		}
		
		size(): number {
			return this.content.values().toArray().map(x => x.size()).reduce((a,b)=>a+b, 0);
		}
		
		
		static init(cs: CardState[]): CardStateBundledSet {
			if (cs.length > 1) throw new Error("Must be one cardstate");
			const initialCs = cs[0]!;
			
			const res = new CardStateBundledSet();
			res.content.set(initialCs.tableCards.keyString(), CardStateBundle.init(initialCs));
			return res;
		}
		
		// clear(): void { 
			// this.content.clear();
		// }
		
		// addStates(states: ManyPlayerCards[]): void {
			// for (const st of states) this.mpcSet.add(st.keyString());
		// }
		
		move(player: number): CardStateBundledSet {
			const res = new CardStateBundledSet();
			res.content = new Map<string, CardStateBundle>();//this.content);
			
			for (const [s, bundle] of this.content) {
				const nextBundles = bundle.move(player);
				
				for (const nb of nextBundles) {
					const ks = nb.tableCards.keyString();
					if (res.content.has(ks)) { res.content.get(ks)!.absorb(nb.pcSet); }
					else res.content.set(ks, nb);
				}
			}

			return res;
		}

			move_save(player: number): CardStateBundledSet {
				const fs = require("fs");
				const writer = fs.createWriteStream("saved_move.txt");
								
				const res = new CardStateBundledSet();
				res.content = new Map<string, CardStateBundle>();//this.content);
				
				for (const [s, bundle] of this.content) {
					const nextBundles = bundle.move(player);
					
					writer.write(">\n");
					
					for (const nb of nextBundles) {
						writer.write(nb.shortInfo() );
						
						
						const ks = nb.tableCards.keyString();
						if (res.content.has(ks)) {
							const prevS = res.content.get(ks)!.size()
							res.content.get(ks)!.absorb(nb.pcSet);
							const nextS = res.content.get(ks)!.size();
							writer.write(`  update ${prevS}->${nextS}, (+${nextS - prevS})`);

						}
						else {
							writer.write("  new entry");
							res.content.set(ks, nb);
						}
						
						writer.write('\n');
					}
				}

				writer.end();


				return res;
			}


	}


	export class WavefrontC extends Wavefront {
		stateSet = CardStateBundledSet.init([DEFAULT_CARDS]);

		moveImpl(): void {
			console.log(`{${this.round},${this.playerTurn}}`);
			
			console.time('move');
			
			
			// if (this.round == 2 && this.playerTurn == 1)
				// this.stateSet = this.stateSet.move_save(this.playerTurn);
			// else
				this.stateSet = this.stateSet.move(this.playerTurn);
			
			console.timeEnd('move');
			
			let maxElem = -1;
			
			// if (false) {
				// const fullObjs = [...this.stateSet.content].map(CardState.fromKeyString);
				// const pts = fullObjs.map(x => x.ofPlayer(this.playerTurn).points);
				// maxElem = pts.reduce((a,b) => Math.max(a, b), 0);
			// }
			
			console.log(`set size ${this.stateSet.size()} (${this.stateSet.numBundles()}) up to ${maxElem}`);
		}
		
	}


	export const INITIAL_STATE = new State(
		DEFAULT_CARDS,
		new TokenState(
			new TokenVec(MAX_TOKEN_STACKS),
			[new TokenVec("000000"), new TokenVec("000000"), new TokenVec("000000"), new TokenVec("000000")].slice(0, N_PLAYERS)
		)
	);



	function writePruning(fname: string, states: TokenState[], player: number, counts: number[]): void { 
		const fs = require("fs");
		const writer = fs.createWriteStream(fname);
		const LEN = states.length;
		for (let i = 0; i < states.length; i++) {
			const thisCount = counts[i]!;
			const killer = thisCount == -1 ? "" : states[LEN-thisCount]!.niceString();
			writer.write(`${i}: ${states[i]!.niceString()}, ${thisCount}: ${killer}\n`);
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
	

}
