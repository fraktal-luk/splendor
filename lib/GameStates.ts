
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


const fs = require('fs');



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


const POINT_TABLE: number[] = [0].concat(CARD_SPECS.map(s => parseInt(s[0])));


const PARAM_TMP_TH = 10 + -0;


const PARAM_TRIM_LOW = true;
const PARAM_TIP_SUB = 3;

const PARAM_COLUMN_WALL = 4;

const PARAM_RUN_DEPTH = /*4*/ 2;  // If no clipping, (PARAM_TRIM_LOW = false), depth doesnt matter

const N_PLAYERS = 2;



function encodeNum2(p: number) { return String.fromCharCode(p, 0); }
function decodeNum2(s: string): number { return s.charCodeAt(0); }

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

abstract class Wavefront {
	readonly nPlayers = N_PLAYERS;

	move(): void {
		this.moveImpl();
	}

	abstract moveImpl(): void;
}

interface StateValue<T> {
	keyString(): string;
	niceString(): string;
	isSame(other: T): boolean;
}


function compareNumbers(a?: number, b?: number): number {
	if (a == undefined && b == undefined) return 0;
	if (a == undefined) return 1;
	if (b == undefined) return -1;
	return a!-b!;
}


function isConsecutive(arr: number[]): boolean {
	if (arr.length == 0) return true;

	let latest = arr[0]!;
	for (let i = 1; i < arr.length; i++) {
		if (arr[i]! - latest != 1) return false;
		latest = arr[i]!;
	}

	return true;
}



export namespace GameStates {
	// For now we assume 2 players, so 44444 token stacks
	export const MAX_TOKEN_STACKS = "444440";
																	"555550";
																	"777770";

	export class PlayerCards implements StateValue<PlayerCards> {
		readonly bonuses: TokenVec;
		readonly points: number;
		//readonly reserved: Card[];
		
		constructor(b: TokenVec, p: number, r: Card[]) {
			this.bonuses = b;
			this.points = p;
			//this.reserved = r;
		}
		
		keyString(): string { return encodeNum2(this.points) + this.bonuses.str; }
		niceString(): string { return `(${numStringD(this.points)})${this.bonuses.toLongString()} []`; }
		isSame(other: PlayerCards): boolean { return this.bonuses.str == other.bonuses.str && this.points == other.points; /* TODO: reserved cards when become relevant*/ }

		static fromKeyString(s: string): PlayerCards { return new PlayerCards(new TokenVec(s.substring(2, 8)), decodeNum2(s), []); }

		// If can afford, otherwise undef
		buyUniversal(c: Card): PlayerCards | undefined {
			const ind = (c-1) % 5;
			const deficit = this.bonuses.TMP_effPrice(c).sum();
			const gold = parseInt(this.bonuses.str[5]!, 16);				
			
			if (deficit > gold) return undefined;

			const newBonuses = this.bonuses.incAt(ind).payGold(deficit);
			const newPoints = this.points + POINT_TABLE[c]!;
			return new PlayerCards(newBonuses, newPoints, []);//this.reserved);
		}
		
		takeUniversal(): PlayerCards {
			return new PlayerCards(this.bonuses.takeUniversal(), this.points, []);
		}

		// Get effective gload price and points
		evaluateCard(c: Card): [Card, number, number] {
				const deficit = this.bonuses.TMP_effPrice(c).sum();
				const points = getCardPoints(c);
				return [c, deficit, points];
		}

	}
	
	const DEFAULT_PLAYER_CARDS = new PlayerCards(new TokenVec("000000"), 0, []);

	export class ManyPlayerCards implements StateValue<ManyPlayerCards> {
		readonly arr: PlayerCards[];
		
		constructor(p: PlayerCards[]) {
			this.arr = p;
		}
		
		keyString(): string { 
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
			
			const playerCards = parts.map(PlayerCards.fromKeyString);
			return new ManyPlayerCards(playerCards);
		}

		playerKString(): string { return this.arr.map(x => x.keyString()).join(''); }
		ofPlayer(player: number): PlayerCards { return this.arr[player]!; }

		buyUniversal(player: number, c: Card): ManyPlayerCards | undefined {
			const thisPlayer = this.ofPlayer(player);
			const thisPlayerNew = thisPlayer.buyUniversal(c);
			if (thisPlayerNew == undefined) return undefined;
			return new ManyPlayerCards(this.arr.with(player, thisPlayerNew!));
		}
		
		takeUniversal(player: number): ManyPlayerCards { return new ManyPlayerCards(this.arr.with(player, this.ofPlayer(player).takeUniversal())); }
		
		maxPoints(): number { return this.arr.map(x => x.points).reduce((a,b) => Math.max(a,b), 0); }
	}



	class Row implements StateValue<Row> {
		readonly stackSize: number;
		readonly cards: number[];

		constructor(ss: number, cards: number[]) {
			this.stackSize = ss;
			this.cards = cards;
		}

		keyString(): string { 
			return String.fromCharCode(this.stackSize, ...this.cards); // 5 chars
		}
		
		niceString(): string { return `[${this.stackSize} ${this.cards}]`; }

		isSame(other: Row): boolean {
			if (other.stackSize != this.stackSize) return false;

			for (let i = 0; i < 4; i++) {
				if (other.cards[i] != this.cards[i]) return false;
			}
			return true;
		}

		static fromKeyString(s: string): Row {			
			const ss = s.charCodeAt(0);
			const cards = Array.from(s.substring(1), c => c.charCodeAt(0));
			return new Row(ss, cards);
		}


		takeCol(thisRow: number, index: number): Row {
			const c = TABLE_STACKS[thisRow]![this.stackSize-1]!;
			const newCards = this.cards.with(index, c);
			newCards.sort((a,b) => a-b);

			return new Row(this.stackSize-1, newCards);
		}

		getNext(thisRow: number): Row[] {
			const res = [0,1,2,3].map(i => this.takeCol(thisRow, i));
			return res;
		}
	}

	const DUMMY_ROW = new Row(0, [0, 0, 0, 0]);
	const INITIAL_ROW0 = new Row(INITIAL_STACK_SIZES[0], INITIAL_TABLE_NUMS[0]);
	const INITIAL_ROW1 = new Row(INITIAL_STACK_SIZES[1], INITIAL_TABLE_NUMS[1]);
	const INITIAL_ROW2 = new Row(INITIAL_STACK_SIZES[2], INITIAL_TABLE_NUMS[2]);



	type RowId = number;


	class RowDesc {
		id: RowId;
		state: Row;
		next?: RowId[];

		constructor(id: RowId, state: Row) {
			this.id = id;
			this.state = state;
		}

	}



	class RowBase {
		descriptors: RowDesc[] =  [new RowDesc(0, DUMMY_ROW), new RowDesc(1, INITIAL_ROW0), new RowDesc(2,INITIAL_ROW1), new RowDesc(2, INITIAL_ROW2)];
		strings: string[] = [DUMMY_ROW.keyString(), INITIAL_ROW0.keyString(), INITIAL_ROW1.keyString(), INITIAL_ROW2.keyString()];


		idMap: Map<string, RowId> = new Map<string, RowId>([[DUMMY_ROW.keyString(), 0],
																												[INITIAL_ROW0.keyString(), 1],
																												[INITIAL_ROW1.keyString(), 2],
																												[INITIAL_ROW2.keyString(), 3],
																											]);

		insert(d: RowDesc, s: string): void {
			if (d.id != this.descriptors.length) throw new Error("wrng insertion");

			this.descriptors.push(d);
			this.strings.push(s);
			this.idMap.set(s, d.id);		
		}

		fillFromArrays(strings: string, followersT: Int32Array): void {
			this.reset();

			const followers = Array.from(followersT);

			const nRead = followers.length / 4;
			const keyStrSize = DUMMY_ROW.keyString().length;

			for (let i = 0; i < nRead; i++) {
				const rFollowers = followersDecode(followers.slice(4*i, 4*i + 4));
				const rKs = strings.substring(keyStrSize*i, keyStrSize*i + keyStrSize);

				const desc = new RowDesc(i, Row.fromKeyString(rKs));
				desc.next = rFollowers;

				this.insert(desc, rKs);
			}
		}

		reset(): void {
			this.descriptors = [];
			this.strings = [];
			this.idMap.clear();
		}


		addDescriptor(rs: Row, ks: string): StateId {
			const newId = this.descriptors.length;
			this.descriptors.push(new RowDesc(newId, rs));
			this.strings.push(ks);

			this.idMap.set(ks, newId);
			return newId;
		}
		
		// Trace mode: don't calculate if not already known 
		getFollowers(thisRow: number, state: RowId): RowId[] {
			const desc = this.descriptors[state];
			if (desc == undefined) throw new Error("State not existing");

			if (desc!.next == undefined) {
				desc!.next = this.makeIds(desc.state.getNext(thisRow));
			}
			
			return desc!.next!;
		}

		makeIds(states: (Row|undefined)[]): RowId[] {
			const nextIds: RowId[] = [];
			
			// Find the states, if not existent then add
			for (const [i, s] of states.entries()) {					
				if (s == undefined) continue;
				
				// Find s in base...
				const keyStr = s.keyString();
				const theId = this.idMap.get(keyStr);
				
				if (theId != undefined) {
					nextIds.push(theId);
				}
				else {
					const newId = this.addDescriptor(s, keyStr);
					nextIds.push(newId)	
				}
			}
			
			nextIds.sort((a,b) => a-b);

			return nextIds;
		}

	}


	export class TableCardsShort implements StateValue<TableCardsShort> {
			rows: RowId[];

			constructor(r: RowId[]) {
				this.rows = r;
			}

			// TODO: should be shortened (remove padding) but fromKeyString in dependents must be modified accordingly
			keyString(): string {
				return String.fromCharCode(...this.rows);// + "............"; // pad to 15
			}


			niceString(): string { return `${this.rows}`; }

			isSame(other: TableCardsShort): boolean {			
				return this.rows[0] == other.rows[0] && this.rows[1] == other.rows[1] && this.rows[2] == other.rows[2];
			}

			static fromKeyString(s: string): TableCardsShort {
				const nums = Array.from(s.substring(0,3), c => c.charCodeAt(0));
				return new TableCardsShort(nums);
			}

			cardAt(index: number): number {
				if (index < 0 || index > 11) throw new Error("Wrong index");
				
				const row = index >> 2;
				const col = index & 3;
				
				const rows = this.rows;
				return getRowBase().descriptors[rows[row]].state.cards[col];
			}

			grabAt(index: number): TableCardsShort {
				if (index < 0 || index > 11) throw new Error("Wrong index");
				
				const row = index >> 2;
				const col = index & 3;

				const resultRows = getRowBase().getFollowers(row, this.rows[row]);
				const newRows = this.rows.with(row, resultRows[col]);

				return new TableCardsShort(newRows);
			}

				grabAt_ByRow(rowInd: number): TableCardsShort[] {
					const resultRows = getRowBase().getFollowers(rowInd, this.rows[rowInd]);
					const newRowsA = resultRows.map(ri => this.rows.with(rowInd, ri));
					return newRowsA.map(rr => new TableCardsShort(rr));
				}

	}


	const DEFAULT_TABLE_CARDS_SHORT = new TableCardsShort([1, 2, 3]);

		export class TableCards implements StateValue<TableCards> {
			readonly stackNums: number[];
			readonly spread: Card[]; // Cards seen on table
			
			constructor(sn: number[], sp: Card[]) {
				this.stackNums = sn;
				this.spread = sp;
			}
			
			keyString(): string {			
				return String.fromCharCode(...this.stackNums, ...this.spread); // 3 (nums) + 12 (cards) = 15
			}

			niceString(): string { return `${this.stackNums} [` + this.spread.map(cardStringD).join(',') + ']'; }

			isSame(other: TableCards): boolean {			
				return this.stackNums.toString() == other.stackNums.toString() && this.spread.toString() == other.spread.toString();
			}

			static fromKeyString(s: string): TableCards {
				const nums = Array.from(s.substring(0,3), c => c.charCodeAt(0));
				const spread = Array.from(s.substring(3,15), c => c.charCodeAt(0));
				return new TableCards(nums, spread);
			}

			cardAt(index: number): number {
					return this.spread[index];
			}

			grabAt(index: number): TableCards {
				if (index < 0 || index > 11) throw new Error("Wrong index");
				
				const row = index >> 2;
				const col = index & 3;
				const stackSize = this.stackNums[row]!;
				
				const newCard = TABLE_STACKS[row]![stackSize-1]!;
				const newStackNums = this.stackNums.toSpliced(row, 1, stackSize-1);

				const newSpread = [...this.spread];
				sortSpread(newSpread, index, newCard);

				return new TableCards(newStackNums, newSpread);
			}

		}
		
	const DEFAULT_TABLE_CARDS = new TableCards(INITIAL_STACK_SIZES, INITIAL_TABLE_NUMS.flat());


		function CONV_TC(tcs: TableCardsShort): TableCards {
			const ss = [getRowBase().descriptors[tcs.rows[0]].state.stackSize, getRowBase().descriptors[tcs.rows[1]].state.stackSize, getRowBase().descriptors[tcs.rows[2]].state.stackSize,];
			const sp = [...getRowBase().descriptors[tcs.rows[0]].state.cards, ...getRowBase().descriptors[tcs.rows[1]].state.cards, ...getRowBase().descriptors[tcs.rows[2]].state.cards,];

			return new TableCards(ss, sp);
		}


	export class CardState implements StateValue<CardState> {
		readonly tableCards_S: TableCardsShort;
		readonly mpc: ManyPlayerCards;
		readonly moves: number; 
		
		constructor(mp: ManyPlayerCards, moves: number, ts: TableCardsShort) {
			this.tableCards_S = ts;
			this.mpc = mp;//new ManyPlayerCards(p);
			this.moves = moves;
		}


		keyString(): string { return this.tableCards_S.keyString() + String.fromCharCode(this.moves) + this.mpc.keyString(); }
		niceString(): string { return CONV_TC(this.tableCards_S).niceString() + '  @' + this.moves + '  ' + this.mpc.niceString(); }


		checkKeyString(): void {
			const str = this.keyString();
			const same = CardState.fromKeyString(str).isSame(this);

			if (!same) throw new Error("Not same!");
		}


		isSame(other: CardState): boolean {
			if (!this.tableCards_S.isSame(other.tableCards_S)) return false;
			return this.mpc.isSame(other.mpc);
		}

		static fromKeyString(s: string): CardState {
			const tableCards_S = TableCardsShort.fromKeyString(s.slice(0,/*16*/4)); // TODO: verify size
			const playerCards = ManyPlayerCards.fromKeyString(s.substring(/*16*/4));
			return new CardState(playerCards, s.charCodeAt(/*15*/3), tableCards_S);
		}

		playerKString(): string { return this.mpc.playerKString(); }

		ofPlayer(player: number): PlayerCards { return this.mpc.ofPlayer(player); }

		takeUniversal(): CardState {
			const player = this.moves;
			return new CardState(this.mpc.takeUniversal(player), (player+1) % N_PLAYERS, this.tableCards_S); 
		}
		
		buyUniversal(ind: number): CardState|undefined {
			const player = this.moves;
				
				  // TMP: limit columns to buy (performance "hack")
				  if ((ind % 4) >= PARAM_COLUMN_WALL) return undefined;

			const c = this.tableCards_S.cardAt(ind);
			const newPlayerCards = this.mpc.arr[player]!.buyUniversal(c);
			
			if (newPlayerCards == undefined) return undefined;
			
			const mpa = this.mpc.arr.with(player, newPlayerCards);
			const mpc = new ManyPlayerCards(mpa);
			return new CardState(mpc, (player+1) % N_PLAYERS, this.tableCards_S.grabAt(ind));
		}

		genNextBU(): (CardState|undefined)[] {			
			const buys = [0, 1, 2, 3,  4, 5, 6,7,  8, 9, 10, 11].map(i => this.buyUniversal(i));
			let res0: (CardState|undefined)[] = [this.takeUniversal()];

				// TODO: remove undefined? remove nonoptimal takes?
			const res = res0.concat(buys);
			return res;
		}

		maxPoints(): number {
			return this.mpc.maxPoints();
		}

		// How many points if the player could now buy cards from the table without competitors intervening (no takes and no filling cards)
		// In other words - converting tokens to points
		prospectPoints(player: number): number {
			const pc = this.mpc.ofPlayer(player);
			//const gold = parseInt(this.bonuses.str[5]!, 16);				

			const inds = [0, 1, 2, 3,  4, 5, 6,7,  8, 9, 10, 11].filter(n => n % 4 < PARAM_COLUMN_WALL);
			const tableCards = inds.map(n => this.tableCards_S.cardAt(n));
			const evals = tableCards.map(c => pc.evaluateCard(c));

			// Now we need to find largest sum of points that can be bought with our gold

				console.log(pc.bonuses);
				console.log(evals.map(a => `(${a})`).join(', '));

			return 0;
		}

	}


	export const DEFAULT_CARDS = new CardState(
										new ManyPlayerCards([DEFAULT_PLAYER_CARDS, DEFAULT_PLAYER_CARDS, DEFAULT_PLAYER_CARDS, DEFAULT_PLAYER_CARDS,].slice(0, N_PLAYERS)),
										0,
											DEFAULT_TABLE_CARDS_SHORT
										);


	//////////////////////////////////////////////////////////

	type StateId = number;

	type NodeCategory = 'unknown'
								| 'late'
				   	  | 'final'  // end the game
				   	  | 'falls'; // leads to known final state (result determined)
	type GameRating = 'U' | '0' | '1' | 'D';



	function undef2nan(x: number|undefined): number {
		if (x == undefined) return NaN;
		return x!;
	}


	function nan2undef(x: number): number|undefined {
		if (isNaN(x)) return undefined;
		return x;
	}

	// empty - all -1; undefined - -1 followed by 0
	function followersFull(input: number[]|undefined): number[] {
		if (input == undefined) return [NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN];

		const res = [...input];
		res[12] = -1;
		res.fill(-1, input.length);
		return res;
	}

	function followersDecode(input: number[]) {
		if (isNaN(input[0]!)) return undefined;

		const end = input.indexOf(-1);
		return input.slice(0, end);
	}


	function valEncode(x: number): number {
		if (isNaN(x)) return 100;
		else return x;
	}

	function valDecode(x:number): number {
		if (x >= 100) return NaN;
		return x;
	}



	// empty - all -1; undefined - -1 followed by 0
	function rowFollowersFull(input: number[]|undefined): number[] {
		if (input == undefined) return [-1, 0, 0, 0];

		const res = [...input];
		res[3] = -1;
		res.fill(-1, input.length);
		return res;
	}

	function rowFollowersDecode(input: number[]) {
		if (input[0] == -1 && input[1] == 0) return undefined;

		const end = input.indexOf(-1);
		return input.slice(0, end);
	}





	// CAREFUL: this function considers 0 better than undefined, so draw rates better than "unknown but don't see a winning move"
	function bestForPlayer(arr: (number|undefined)[], player: number): number|undefined {
		const sorted = arr.filter(x => x != undefined && !isNaN(x)).toSorted((a,b) => a! - b!);

		if (sorted.length == 0) return undefined;

		const hasUndef = arr.includes(undefined) || arr.includes(NaN);

		const first = sorted.at(0)!;
		const last = sorted.at(-1)!;

		// Dont accept losing position if some is unknown
		// Dont accept draw if not sure
		if (player == 0) {
			if (last <= 0 && hasUndef) return undefined;
		}
		else {
			if (first >= 0 && hasUndef) return undefined;
		}

		const tmpResult = player == 0 ? last : first;

		return player == 0 ? last : first;
	}

	class StateDesc {
		id: StateId;
		//state: CardState;
		next?: StateId[];
		//finalDiff?: number = undefined;

			mover = -1;
			maxP = -1;
			playerPts = [-1, -1];


		// rating(): GameRating {
		// 	const diff = this.finalDiff;
		// 	if (diff == undefined) return 'U';
		// 	else if (diff! > 0) return '0'; 
		// 	else if (diff! < 0) return '1'; 
		// 	else return 'D';
		// }


			moves(): number {
				return this.mover;
			}

			maxPoints(): number {
				return Math.max(this.playerPts[0], this.playerPts[1]);
			}

			playerPoints(p: number): number {
					return this.playerPts[p]!;
			}

		diffP(): number {
			return this.playerPoints(0) - this.playerPoints(1);
		}

		// isDone(): boolean {
		// 	return this.finalDiff != undefined;
		// }
		
		isFinal(): boolean {
			const isChecked = this.maxPoints() >= PARAM_TMP_TH && this.moves() == 0;
			return isChecked;
		}

		isLate(): boolean {
			const isChecked = this.maxPoints() >= PARAM_TMP_TH && this.moves() != 0;
			return isChecked;
		}

		constructor(id: StateId, state: CardState) {
			this.id = id;

			this.mover = state.moves;
			this.playerPts = [state.ofPlayer(0).points, state.ofPlayer(1).points]; 

			this.rateFinal();
		}


		rateFinal(): void {
			if (!this.isFinal()) return;

			//this.finalDiff = this.diffP();
		}

	}


	//type StateList = StateId[];
	type StateList = Set<StateId>;

	function makeStateList(arr: StateId[]): StateList {
		//return arr;
		return new Set(arr);
	}

	function getStateListSize(sl: StateList): number {
		//return sl.length;
		return sl.size;
	}

	function stateArr(sl: StateList): StateId[] {
		return sl.values().toArray();
	}


	function desc2sl(sd: StateDesc): StateList {
		return makeStateList([sd.id]);
	}



	class StateBase {
		descriptors: StateDesc[] = [new StateDesc(0, DEFAULT_CARDS)];
		strings: string[] = [DEFAULT_CARDS.keyString()];
		
		values: number[] = [NaN];

		idMap: Map<string, StateId> = new Map<string, StateId>([[DEFAULT_CARDS.keyString(), 0]]);


		reset(): void {
			this.descriptors = [];
			this.strings = [];
			this.idMap.clear();
		}

		insert(d: StateDesc, s: string, v: number): void {
			if (d.id != this.descriptors.length) throw new Error("wrng insertion");

			this.descriptors.push(d);
			this.strings.push(s);
			this.values.push(v);
			this.idMap.set(s, d.id);
		}

		fillFromArrays(strings: string, followersT: Float32Array, valuesT: Float32Array): void {
			this.reset();

			const followers = Array.from(followersT);
			const values = Array.from(valuesT);

			const nRead = followers.length / 13;
			const keyStrSize = DEFAULT_CARDS.keyString().length;

			for (let i = 0; i < nRead; i++) {
				const rFollowers = rowFollowersDecode(followers.slice(13*i, 13*i + 13));
				const rKs = strings.substring(keyStrSize*i, keyStrSize*i + keyStrSize);
				const rValue = (values[i]);

				const desc = new StateDesc(i, CardState.fromKeyString(rKs));
				desc.next = rFollowers;
			//	desc.finalDiff = nan2undef(rValue);

				this.insert(desc, rKs, rValue);
			}
		}


			IS_DONE(d: StateDesc): boolean {
					const res = !isNaN(this.values[d.id]!);
					return res;
			}

			FALLS(d: StateDesc): boolean {
					return this.IS_DONE(d) && !d.isFinal();
			}

			RATING(d: StateDesc): GameRating {
				//	return d.rating();

					const v = this.values[d.id];

				const diff = v;//d.finalDiff;


				//	if (diff != undefined && diff != v) throw new Error("value wrong?");

				if (diff == undefined) return 'U';
				else if (diff! > 0) return '0'; 
				else if (diff! < 0) return '1'; 
				else return 'D';
			}


		getDesc(s: StateId) {
			if (s >= this.descriptors.length) throw new Error(`non existing StateID #${s}, of ${this.descriptors.length}`); 
			return this.descriptors[s];
		}

		getNiceString(s: StateId): string {
			return CardState.fromKeyString(this.strings[s]).niceString();
		}

		addDescriptor(cs: CardState, ks: string): StateId {
			const newId = this.descriptors.length;

			const newDesc = new StateDesc(newId, cs);

			const value = newDesc.isFinal() ? newDesc.diffP() : NaN;

			this.descriptors.push(newDesc);
			this.strings.push(ks);
			this.values.push(value);//undef2nan(newDesc.finalDiff));

			this.idMap.set(ks, newId);
			return newId;
		}
		
		// Trace mode: don't calculate if not already known 
		getFollowers(state: StateId, trace: boolean = false): StateId[] {
			const desc = this.descriptors[state];
			if (desc == undefined) throw new Error("State not existing");

			if (!trace && this.IS_DONE(desc)/*.isDone()*/) return [];

			const stateObjS = CardState.fromKeyString(this.strings[state]);

			if (trace) {
				if (desc!.next == undefined) {
					return [];
				}
			}
			else {
				if (desc!.next == undefined) {
					desc!.next = this.makeIds(stateObjS.genNextBU());
				}
			}

			return desc!.next!;
		}


		makeIds(states: (CardState|undefined)[]): StateId[] {
			const nextIds: StateId[] = [];
			
			// Find the states, if not existent then add
			for (const [i, s] of states.entries()) {					
				if (s == undefined) continue;
				
				// Find s in base...
				const keyStr = s.keyString();
				const theId = this.idMap.get(keyStr);
				
				if (theId != undefined) {
					nextIds.push(theId);
				}
				else {
					const newId = this.addDescriptor(s, keyStr);
					nextIds.push(newId)	
				}
			}

			nextIds.sort((a,b) => a-b);

			return nextIds;
		}

		getFollowerDescs(state: StateId): StateDesc[] {
			const nextIds = this.descriptors[state]!.next!;
			return nextIds.map(x => this.descriptors[x]!);
		}

		followersRatings(state: StateId): GameRating[] {
			return this.getFollowerDescs(state).map(x => this.RATING(x));
		}

		genBatchFollowers(input: StateList, trace: boolean = false): StateList {
			const flatArr = input.values().map(x => this.getFollowers(x, trace)).toArray().flat(); // Can't use flatMap because getFollowers naturallny returns arrays (without copy) 
			const stateSet = new Set<StateId>(flatArr); 
			const result = stateSet;
			return result;
		}

			// Used more memory and is not faster:
			genBatchFollowers_N(input: StateId[], trace: boolean = false): StateId[] {
				const theSet = new Set<StateId>();
				const flatArr = input.forEach(x => this.getFollowers(x, trace).forEach(s => theSet.add(s) ) );
				return Array.from(theSet);
			}


		// states that are meant to grow - their followers are not known yet
		getTips(): StateList {
			return makeStateList(this.descriptors.filter(d => d.next == undefined).map(d => d.id));
		}

		getTipsAtLeast(min: number): StateList {
			return makeStateList(this.descriptors.filter(d => d.next == undefined && d.maxPoints() >= min).map(d => d.id));
		}

		getTipDescs(): StateDesc[] {
			return this.descriptors.filter(d => d.next == undefined);
		}

		rateNonfinals(): void {			
			this.descriptors.forEach(x => this.processNonfinal(x));
		}


		// backtrack from definite states
		processNonfinal(desc: StateDesc): void {
			if (this.IS_DONE(desc) || desc.isFinal() || desc.next == undefined) return;

			const nextIds = this.descriptors[desc.id]!.next!;

			const fds = this.getFollowerDescs(desc.id);
			const mover = desc.moves();
			const fdiffs = fds.map(d => //d.finalDiff);
																  this.values[d.id]!);


			const bestResult = bestForPlayer(fdiffs, mover);
			//desc.finalDiff = bestResult;

			this.values[desc.id] = undef2nan(bestResult);

			const bestResultNum = undef2nan(bestResult);
		}

	}



	const rowBase = new RowBase();
	const mainBase = new StateBase();


	function getRowBase(): RowBase {
		return rowBase;
	}

	function getMainBase(): StateBase {
		return mainBase;
	}





	export class WavefrontC extends Wavefront {
		stateBase = new StateBase();

		active: StateList = makeStateList([0]);
		maxTipPts = 0;

		finished: boolean = false;
		stepNum = 0;

		latestList = makeStateList([0]);
		pointThreshold = 0;

			save(): void {

				const rowAllStr = getRowBase().strings.join('');
				const rowAllFollowers = getRowBase().descriptors.map(d => rowFollowersFull(d.next)).flat();


					const nStr = this.stateBase.strings.length;
					const STRLEN = this.stateBase.strings[0].length;

				//const allStr = this.stateBase.strings.join('');
				//const allFollowers = this.stateBase.descriptors.map(d => followersFull(d.next)).flat();
				const allValues = this.stateBase.values;
					// for (let i = 0; i < this.stateBase.descriptors.length; i++) {
					// 		if ((this.stateBase.descriptors[i].finalDiff) != nan2undef(this.stateBase.values[i])) throw new Error("Fck! udef, NAN?");
					// }

				const keyStrSize = DEFAULT_CARDS.keyString().length;
				//const nRead = allFollowers.length / 13;


					const strBuf = new Int16Array(nStr * STRLEN);
					const follBuf = new Float32Array(nStr * 13);

					this.stateBase.strings.forEach( (s, ind)  => {
						strBuf.set(Array.from(s, x => x.charCodeAt(0)), STRLEN * ind);
					});

					this.stateBase.descriptors.forEach( (d, ind)  => {
						follBuf.set(followersFull(d.next), 13 * ind);
					});

				//const stringBuf = Int16Array.from(allStr);
				
						console.log(`A ${strBuf.length}: ` + strBuf.slice(0,20));
					//	console.log(`B ${stringBuf.length}: ` + stringBuf.slice(0, 20));


				//const followerBuf = Float32Array.from(allFollowers);
				const valueBuf = Float32Array.from(allValues);

				fs.writeFileSync('saved_3/rstrings', rowAllStr, 'utf16le', console.log);
				fs.writeFileSync('saved_3/rfollowers', Int32Array.from(rowAllFollowers));

				//fs.writeFileSync('saved_2/strings', allStr, 'utf16le', console.log);
				fs.writeFileSync('saved_3/strings', strBuf, console.log);
				//fs.writeFileSync('saved_2/followers', followerBuf, console.log);
				fs.writeFileSync('saved_3/followers', follBuf, console.log);
				fs.writeFileSync('saved_3/values', valueBuf, console.log);

			}


			load(): void {
				console.time('loading');

				const loadedRowS = fs.readFileSync('saved_1/rstrings', "utf16le");
				const loadedRowF = new Uint8Array(fs.readFileSync('saved_1/rfollowers'));
				const loadedRowF32 = new Int32Array(loadedRowF.buffer);

				const loadedS = fs.readFileSync('saved_1/strings', "utf16le");
				const loadedF = new Uint8Array(fs.readFileSync('saved_1/followers'));
				const loadedF32 = new Float32Array(loadedF.buffer);

				const loadedV = new Uint8Array(fs.readFileSync('saved_1/values'));
				const loadedV32 = new Float32Array(loadedV.buffer);

				getMainBase().fillFromArrays(loadedS, loadedF32, loadedV32);

				getRowBase().fillFromArrays(loadedRowS, loadedRowF32);

				console.timeEnd('loading');

				this.stateBase = getMainBase();
			}



		// Needed for interface compliance
		moveImpl(): void {
		}

		runStep(): void {
			if (this.finished) {
				const firstU = this.stateBase.values.findIndex(x => isNaN(x));

				// const uSet = makeStateList([firstU]);
				// this.runDepth(uSet, 16);

				// this.propagateStates();

				// const firstUnew = this.stateBase.values.findIndex(x => isNaN(x));

				// this.stats();

				// console.log(`${firstU} -> ${firstUnew}`);

				return;
			}

			console.log('> Step ' + this.stepNum);

			this.expand();
			this.propagateStates();
			this.stats();

			if (this.stateBase.FALLS(this.stateBase.descriptors[0]!)) {//  this.stateBase.descriptors[0]!.falls()) {
				console.log(`\n  >>>  Discovered solution! Result is ${this.stateBase.RATING(this.stateBase.descriptors[0]!)}`);
				//this.finished = true;
			}

			this.stepNum++;
		}

		expand(): void {
			const thr = this.pointThreshold;
			const startStates = this.stateBase.getTipsAtLeast(this.pointThreshold);

				console.log(`starting with size ${getStateListSize(startStates)}`);

			const nextStates = this.runDepth(startStates, PARAM_RUN_DEPTH);

			const currentMaxP = this.stateBase.descriptors/*.filter(d => d.next == undefined)*/.map(d => d.maxPoints()).reduce((a,b) => Math.max(a, b), 0);
			const currentMaxTipP = this.stateBase.descriptors.filter(d => d.next == undefined).map(d => d.maxPoints()).reduce((a,b) => Math.max(a, b), 0);


			this.pointThreshold = PARAM_TRIM_LOW ? currentMaxTipP - PARAM_TIP_SUB : 0;
			this.latestList = nextStates;

			console.log(`  max ${currentMaxP}, (tip ${currentMaxTipP}) thr ${this.pointThreshold}`);
		}

		// n steps of followers
		runDepth(states: StateList, depth: number, trace: boolean = false): StateList {
			const log = !trace;
			let currentStates = states;

			for (let i = 0; i < depth; i++) {
				if (log) console.time('exp');
				currentStates = this.stateBase.genBatchFollowers(currentStates, trace); 
				if (log) console.log(`  setsize ${getStateListSize(currentStates)}`);
				if (log) console.timeEnd('exp');

				// Probably useless anyway!
				const PARAM_REJECT_KNOWN = false;

				if (PARAM_REJECT_KNOWN) {
					const filteredList = stateArr(currentStates).filter(x => this.stateBase.RATING(this.stateBase.getDesc(x)) == 'U');
					currentStates = makeStateList(filteredList);
				}
			}

			return currentStates;
		}


		// Marks as done if a state has a known and determined future
		propagateStates(): number {
			console.time('rating');

			// Backtrack from final states
			let nDone = 0;
			let ct = 0;
			while (true) {
				ct++;
				this.stateBase.rateNonfinals();
				const newDone =	this.stateBase.descriptors.filter(x => this.stateBase.IS_DONE(x)).length;
				if (newDone == nDone) break;
				nDone = newDone;
			}
			console.timeEnd('rating');

			return ct;
		}

		// Refers to whole descriptor base, not a chosen subset
		stats(): void {
			const pts = this.stateBase.descriptors.map(x => x.maxPoints());
			const maxPts = pts.reduce((a,b) => Math.max(a,b), 0);

			const tipPts = this.stateBase.getTipDescs().map(d => d.maxPoints());
			const maxTipPts = tipPts.reduce((a,b) => Math.max(a,b), 0);
			this.maxTipPts = maxTipPts;

			const latestDescs = this.stateBase.descriptors;
			const nFinal = latestDescs.filter(x => x.isFinal()).length;
			const nFalls = latestDescs.filter(x => this.stateBase.FALLS(x)).length;

			const nAll = this.stateBase.descriptors.length;

			const nUnknown = nAll - nFinal - nFalls;


			console.log(`   all: ${nAll}, (${nFinal}, ${nFalls}, ${nUnknown}) ${((nFinal+nFalls)/nAll).toFixed(3)} // maxPoints = ${maxPts} (tip ${maxTipPts})`);

			const nDone = this.stateBase.descriptors.filter(x => this.stateBase.IS_DONE(x)).length;
			const n0 = this.stateBase.descriptors.filter(x => this.stateBase.RATING(x) == '0').length;
			const n1 = this.stateBase.descriptors.filter(x => this.stateBase.RATING(x) == '1').length;
			const nD = this.stateBase.descriptors.filter(x => this.stateBase.RATING(x) == 'D').length;
			const nU = this.stateBase.descriptors.filter(x => this.stateBase.RATING(x) == 'U').length;
			console.log(`    nDone: ${nDone}/ (0,D,1) ${n0}, ${nD}, ${n1}`);

			console.log(process.memoryUsage());

		}



			traceSingle(): void {

					const histories: StateDesc[][] = [];

					let pathHistory: StateDesc[] = [];
					let pivot = this.stateBase.descriptors[0]!;

					let ct = 0;
					while (ct < 1000) {
						ct++;

						const newTrack = this.expandSinglePath([pivot]);

						{
							const last = newTrack.at(-1)!;
							console.log(`Tracing path (${ct}),  points ${last.playerPoints(0)}:${last.playerPoints(1)}`);
							console.log(pathHistory.map(d => d.id).join(', ') + "...");
							console.log(newTrack.map(d => d.id).join(', '));

								//const ns = //d.getNiceString();
									//					this.stateBase.getNiceString(d.id);
									console.log(pathHistory.map(d => `${d.id}: ` + this.stateBase.getNiceString(d.id)).join('\n') + "\n...");
									console.log(newTrack.map(d => `${d.id}: ` + this.stateBase.getNiceString(d.id)).join('\n'));

							if (ct > 2800 && ct < 2820) {
								console.log('Points:')
								console.log(pathHistory.map(d => `(${d.playerPoints(0)}:${d.playerPoints(1)})`).join(' ') + '...');
							}
						}

						pathHistory = pathHistory.concat(newTrack);
						histories.push([...pathHistory]);

						const propagationIters = this.propagateStates();
						const lastUnk = pathHistory.findLast(x => this.stateBase.RATING(x) == 'U')!;
						const lastUnknownIndex = pathHistory.findLastIndex(x => this.stateBase.RATING(x) == 'U')!;

								console.log(`cut: ${pathHistory.length - 1 - lastUnknownIndex}, Len: ${newTrack.length}, prop: ${propagationIters}`);
								console.log(`Wins: ${this.stateBase.RATING(newTrack.at(-1)!)}, last U moves: ${lastUnk.moves()}\n`);

							if (lastUnknownIndex == -1) {
									console.log('ok, all known!');
									break;
							}

						// now look at followers of lastUnk
						this.stateBase.genBatchFollowers(desc2sl(lastUnk));
						const fds = this.stateBase.getFollowerDescs(lastUnk.id);
						// one which is undefined too
						pivot = fds.find(d => this.stateBase.RATING(d) == 'U')!;

						pathHistory = pathHistory.slice(0, lastUnknownIndex+1); // Cut what's after the lastUnk
					}

					pathHistory.forEach(d => console.log(d));
			}


		expandSinglePath(input: StateDesc[]): StateDesc[] {
				console.time('singlepath');

				const res: StateDesc[] = [];

				const tips = input;
				tips.sort((a,b) => Math.abs(a.diffP()) - Math.abs(b.diffP()));

				let currentTip = tips.at(-1)!;
				let ct = 0;

				while (ct < 150) {//currentTip.category != 'final') {
						res.push(currentTip);
					ct++;

					const mover = currentTip.moves();
					this.stateBase.genBatchFollowers(makeStateList([currentTip.id]));
					const fds = this.stateBase.getFollowerDescs(currentTip.id); // getFollowerDescs returns existing follower list!

					fds.sort((a,b) => (a.diffP()) - (b.diffP()));

					if (currentTip.isFinal()) break;
					if (fds.length == 0) {
						console.log('\n>>>> no followers! State is');
						console.log(currentTip);
					}

					currentTip = mover == 0 ? fds.at(-1)! : fds.at(0)!;
				}
				console.timeEnd('singlepath');
				return res;
		}


		TMP_print(currentTip: StateDesc): void {
				const fds = this.stateBase.getFollowerDescs(currentTip.id); // getFollowerDescs returns existing follower list!
				fds.sort((a,b) => (a.diffP()) - (b.diffP()));

					console.log(currentTip.id);
		}

	}






}
