
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


const POINT_TABLE: number[] = [0].concat(CARD_SPECS.map(s => parseInt(s[0])));


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
	
	interface StateValue<T> {
		keyString(): string;
		niceString(): string;
		isSame(other: T): boolean;
	}

export namespace GameStates {
	// For now we assume 2 players, so 44444 token stacks
	export const MAX_TOKEN_STACKS = "444440";
									"555550";
									"777770";



	export class PlayerCards implements StateValue<PlayerCards> {
		readonly bonuses: TokenVec;
		readonly points: number;
		readonly reserved: Card[];
		
		constructor(b: TokenVec, p: number, r: Card[]) {
			this.bonuses = b;
			this.points = p;
			this.reserved = r;
		}
		
		keyString(): string { return encodeNum2(this.points) + this.bonuses.str; }
		
		niceString(): string { return `(${numStringD(this.points)})${this.bonuses.toLongString()} []`; }

		isSame(other: PlayerCards): boolean { return this.bonuses.str == other.bonuses.str && this.points == other.points; /* TODO: reserved cards when become relevant*/ }

		static fromKeyString(s: string): PlayerCards { return new PlayerCards(new TokenVec(s.substring(2, 8)), decodeNum2(s), []); }
		
		covers(other: PlayerCards): boolean {
			return false//(this.points >= other.points && this.bonuses.covers(other.bonuses))
				|| (this.points > other.points && this.bonuses.str == (other.bonuses.str));
		}

		acquire(c: Card): PlayerCards {
			const ind = (c-1) % 5;
			const newBonuses = this.bonuses.incAt(ind);
			const newPoints = this.points + POINT_TABLE[c]!;//getCardPoints(c);
			return new PlayerCards(newBonuses, newPoints, this.reserved);
		}
			
		// If if can afford, otherwise undef
		buyUniversal(c: Card): PlayerCards | undefined {
			const ind = (c-1) % 5;
			const deficit = this.bonuses.TMP_effPrice(c).sum();
			const gold = parseInt(this.bonuses.str[5]!, 16);				
			
			if (deficit > gold) 
				return undefined;

			const newBonuses = this.bonuses.incAt(ind).payGold(deficit);
			const newPoints = this.points + POINT_TABLE[c]!;//getCardPoints(c);
			return new PlayerCards(newBonuses, newPoints, this.reserved);
		}
		
		takeUniversal(): PlayerCards {
			return new PlayerCards(this.bonuses.takeUniversal(), this.points, []);
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
			
			const eights = parts;
			const playerCards = eights.map(PlayerCards.fromKeyString);
			return new ManyPlayerCards(playerCards);
		}

		playerKString(): string { return this.arr.map(x => x.keyString()).join(''); }

		ofPlayer(player: number): PlayerCards { return this.arr[player]!; }

		acquire(player: number, c: Card): ManyPlayerCards {
			const thisPlayer = this.ofPlayer(player);
			const thisPlayerNew = thisPlayer.acquire(c);
			return new ManyPlayerCards(this.arr.with(player, thisPlayerNew));
		}
		
		buyUniversal(player: number, c: Card): ManyPlayerCards | undefined {
			const thisPlayer = this.ofPlayer(player);
			const thisPlayerNew = thisPlayer.buyUniversal(c);
			if (thisPlayerNew == undefined) return undefined;
			return new ManyPlayerCards(this.arr.with(player, thisPlayerNew!));
		}
		
		takeUniversal(player: number): ManyPlayerCards { return new ManyPlayerCards(this.arr.with(player, this.ofPlayer(player).takeUniversal())); }
		maxPoints(): number { return this.arr.map(x => x.points).reduce((a,b) => Math.max(a,b), 0); }
		minPoints(): number { return this.arr.map(x => x.points).reduce((a,b) => Math.min(a,b), 0); }
		absDiffPoints(): number { return Math.abs(this.ofPlayer(0).points - this.ofPlayer(1).points); }
	}

	

	


	export class TableCards implements StateValue<TableCards> {
		readonly stackNums: number[];
		readonly spread: Card[]; // Cards seen on table
		
		constructor(sn: number[], sp: Card[]) {
			this.stackNums = sn;
			this.spread = sp;
		}
		
		keyString(): string {			
			return String.fromCharCode(...this.stackNums, ...this.spread, 0); // 3 (nums) + 12 (cards) + 1 ('0' to pad) = 16
		}

		niceString(): string { return `${this.stackNums} [` + this.spread.map(cardStringD).join(',') + ']'; }

		isSame(other: TableCards): boolean {			
			return this.stackNums.toString() == other.stackNums.toString() && this.spread.toString() == other.spread.toString();
		}

		static fromKeyString(s: string): TableCards {
			const nums = Array.from(s.substring(0,3), c => c.charCodeAt(0));//.map(c => c.charCodeAt(0));
			const spread = Array.from(s.substring(3,15), c => c.charCodeAt(0));//.map(c => c.charCodeAt(0));		
			return new TableCards(nums, spread);
		}

		cardAt(index: number): Card {
			if (index < 0 || index > 11) throw new Error("Wrong index");
			return this.spread[index]!;
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

		grab(c: Card): TableCards {
			const index = this.spread.indexOf(c);
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
		niceString(): string { return this.tableCards.niceString() + '    ' + this.mpc.niceString(); }

		isSame(other: CardState): boolean {			
			if (!this.tableCards.isSame(other.tableCards)) return false;
			return this.mpc.isSame(other.mpc);
		}

		static fromKeyString(s: string): CardState {
			const tableCards = TableCards.fromKeyString(s.slice(0,16)); // TODO: verify size
			const playerCards = ManyPlayerCards.fromKeyString(s.substring(16)).arr;
			return new CardState(tableCards, playerCards);
		}

		playerKString(): string { return this.mpc.playerKString(); }

		ofPlayer(player: number): PlayerCards { return this.mpc.ofPlayer(player); }

		takeUniversal(player: number): CardState { return new CardState(this.tableCards, this.mpc.takeUniversal(player).arr); }			

			steal(player: number, c: Card): CardState {
				const newPlayerCards = [...this.mpc.arr];
				newPlayerCards[player]! = newPlayerCards[player]!.acquire(c);
				return new CardState(this.tableCards.grab(c), newPlayerCards);
			}
		
		buyUniversal(player: number, c: Card): CardState | undefined {
			const newPlayerCardsArr = [...this.mpc.arr];
			const newPlayerCards = newPlayerCardsArr[player]!.buyUniversal(c);
			
			if (newPlayerCards == undefined) return undefined;
			
			newPlayerCardsArr[player]! = newPlayerCards!;
			return new CardState(this.tableCards.grab(c), newPlayerCardsArr);
		}
		
			genNextStolen(player: number): CardState[] { return this.tableCards.spread.map(c => this.steal(player, c)); }

			addNextStolen(player: number): CardState[] {
				const thisArr: CardState[] = [this.takeUniversal(player)];
				return thisArr.concat(this.genNextStolen(player));
			}

			genNextBU(player: number): (CardState|undefined)[] {
				let res: (CardState|undefined)[] = [this.takeUniversal(player)];
				res = res.concat( this.tableCards.spread.map(c => this.buyUniversal(player, c)) );
				
				
					const dbStr =	'15,26,36 [02,04,13,20,24,31,39,44,53,67,75,88]    (00)[a]00000a []  (04)[3]001002 []';
					if (res.some(x => (x != undefined) && x.niceString() == dbStr)) {
						console.log(`         Yes: ${this.niceString()} => ${dbStr}`);
					}
				
				return res;
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
					// TODO: implement buyUniversal for full CardState
					const next = sFull.addNextStolen(player);
					res.addStates(next);
				}

				return res;
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
			
			toFullArray(): CardState[] {
				return this.pcSet.values().map(x => new CardState(this.tableCards, ManyPlayerCards.fromKeyString(x).arr)).toArray();
			}
			
			detailedString(): string {
				let res = `detailed(${this.tableCards.niceString()}) {\n`;
				
				for (const p of this.pcSet)
					res += "    " + ManyPlayerCards.fromKeyString(p).niceString() + "\n";
				
				res += "}\n";
				
				return res;
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

			
			takeUniversal(player: number): CardStateBundle {
				const res = new CardStateBundle();
				res.tableCards = this.tableCards;
				res.pcSet = new Set<string>(this.pcSet.values().map(ManyPlayerCards.fromKeyString).map(x => x.takeUniversal(player).keyString())/*.toArray()*/);
				return res;
			}


			moveStolen(player: number): CardStateBundle[] {
				const res: CardStateBundle[] = [this.takeUniversal(player)];
				
				for (const [ind, c] of this.tableCards.spread.entries()) {
					const nextTc = this.tableCards.grabAt(ind);
					const nextPcSet = this.pcSet.values().map(x => ManyPlayerCards.fromKeyString(x).acquire(player, c).keyString());
					
					const nextBundle = new CardStateBundle();
					nextBundle.tableCards = nextTc;
					nextBundle.pcSet = new Set<string>(nextPcSet);
					
					res.push(nextBundle);
				}
				
				return res;
			}


			moveBU(player: number): CardStateBundle[] {
				const res: CardStateBundle[] = [this.takeUniversal(player)];
				
				// 
				for (const [ind, c] of this.tableCards.spread.entries()) {	
						// !! Here we can exclude columns from buying
						if ((ind % 4) >= 4) continue;
					
					const nextTc = this.tableCards.grabAt(ind);
					const nextPcSet = this.pcSet.values().toArray().map(x => ManyPlayerCards.fromKeyString(x).buyUniversal(player, c)).filter(x => x != undefined).map(x => x.keyString());
					
					if (nextPcSet.length > 0)
					{
						const newSet = new Set<string>(nextPcSet);
						const nextBundle = new CardStateBundle();
						nextBundle.tableCards = nextTc;
						nextBundle.pcSet = newSet
						res.push(nextBundle);
					}
				}
				
				return res;
			}


			shortInfo(): string {
				return this.tableCards.niceString() + `, set(${this.pcSet.size})`;
			}
			
			maxPoints(): number {
				return this.pcSet.values().map(x => ManyPlayerCards.fromKeyString(x).maxPoints()).reduce((a,b) => Math.max(a,b), 0);
			}

			minPoints(): number {
				return this.pcSet.values().map(x => ManyPlayerCards.fromKeyString(x).minPoints()).reduce((a,b) => Math.min(a,b), 0);
			}

			// TODO: extend to >2 players?
			absDiffPoints(): number {
				return this.pcSet.values().map(x => ManyPlayerCards.fromKeyString(x).absDiffPoints()).reduce((a,b) => Math.max(a,b), 0);
			}
			
		}


		class CardStateBundledSet {
			content = new Map<string, CardStateBundle>();
			
			numBundles(): number {
				return this.content.size;
			}
			
			size(): number {
				return this.content.values().map(x => x.size()).reduce((a,b)=>a+b, 0);
			}
			
			toFullArray(): CardState[] {
				return this.content.values().map(x => x.toFullArray()).toArray().flat();
			}
			
				pointHistogram(): number[] {
					let res: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ];
					const fullArr = this.toFullArray();
					
					fullArr.forEach(x => {
						const mp = x.mpc.maxPoints();
						res[mp]++;
					});
					
					return res;
				}
				
				diffHistogram(): number[] {
					let res: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ];
					const fullArr = this.toFullArray();
					
					fullArr.forEach(x => {
						const mp = x.mpc.absDiffPoints();
						res[mp]++;
					});
					
					return res;
				}
			
			
			static init(cs: CardState[]): CardStateBundledSet {
				if (cs.length > 1) throw new Error("Must be one cardstate");
				const initialCs = cs[0]!;
				
				const res = new CardStateBundledSet();
				res.content.set(initialCs.tableCards.keyString(), CardStateBundle.init(initialCs));
				return res;
			}


			moveBU(player: number): CardStateBundledSet {
				const res = new CardStateBundledSet();
				res.content = new Map<string, CardStateBundle>();//this.content);
				
				for (const [s, bundle] of this.content) {
					const nextBundles = bundle.moveBU(player);
					
					for (const nb of nextBundles) {
						const ks = nb.tableCards.keyString();
						if (res.content.has(ks)) { res.content.get(ks)!.absorb(nb.pcSet); }
						else res.content.set(ks, nb);
					}
				}

				return res;
			}

			moveBU_save(player: number): CardStateBundledSet {
				const fs = require("fs");
				const writer = fs.createWriteStream("saved_move.txt");
								
				const res = new CardStateBundledSet();
				res.content = new Map<string, CardStateBundle>();
				
				for (const [s, bundle] of this.content) {
					const nextBundles = bundle.moveBU(player);
					
					writer.write(">\n");
					
					for (const nb of nextBundles) {
						writer.write(nb.shortInfo() );
						
						const ks = nb.tableCards.keyString();
						if (res.content.has(ks)) {
							const prevS = res.content.get(ks)!.size()
							res.content.get(ks)!.absorb(nb.pcSet);
							const nextS = res.content.get(ks)!.size();
							
							writer.write(`  update ${prevS}->${nextS}, (+${nextS - prevS})\n`);
							
							if (nextS >= 100) writer.write(res.content.get(ks)!.detailedString());
						}
						else {
							writer.write("  new entry\n");
							res.content.set(ks, nb);
						}

					}
				}

				writer.end();

				return res;
			}


			maxPoints(): number {
				return this.content.values().map(x => x.maxPoints()).reduce((a,b) => Math.max(a,b), 0);
			}

		}


	type StateId = number;


	class StateDesc {
		id: StateId;
		seq: string = "";
		state: CardState;// = DEFAULT_CARDS;
		next?: StateId[]; //
		
		
		constructor(id: StateId, state: CardState) {
			this.id = id;
			this.state = state;
		}
		
		// static fromState(state: CardState | undefined): StateDesc {
			// const res = new StateDesc(-1);
			// if (state != undefined) {
				// res.state = state!;
					// res.id = 0;
			// }
			// else {

			// }	
			// return res;
		// }
		
		// getNext(player: number): StateDesc[] {
			// let res: StateDesc[] = [];
			
			// const nextStates = this.state.genNextBU(player);
			
			// res = nextStates.map(StateDesc.fromState);
			
			// for (const [ind, desc] of res.entries()) {
				// desc.seq = this.seq + ind.toString(16);
			// }
			
			// return res;
		// }
	}


	class StateBase {
		descriptors: StateDesc[] = [new StateDesc(0, DEFAULT_CARDS)];
		idMap: Map<string, StateId> = new Map<string, StateId>([[DEFAULT_CARDS.keyString(), 0]]);
		
		addDescriptor(cs: CardState): StateId {
			const newId = this.descriptors.length;
			this.descriptors.push(new StateDesc(newId, cs));
			
			this.idMap.set(cs.keyString(), newId);
			
			return newId;
		}
		
		getFollowers(player: number, state: StateId): StateId[] {
			const desc = this.descriptors[state];
			
			if (desc == undefined) throw new Error("State not existing");
			
			const storedFollowers = desc!.next;
			
			if (storedFollowers == undefined) {
				// Need to create
				const nextStates = desc.state.genNextBU(player);
				
				desc!.next = []; // Create list
				
				// Find the states, if not existent then add
				for (const [i, s] of nextStates.entries()) {
						//console.log(`> ${i}: ${s}`);
					
					if (s == undefined) continue;
					
					// Have we seen s somewhere?
					// Find s in base...
					const keyStr = s.keyString();
					const theId = this.idMap.get(keyStr);
					
					if (theId != undefined) {
						desc!.next.push(theId);
					}
					else {
						const newId = this.addDescriptor(s);
						desc!.next.push(newId)	
					}
				}
				
				//desc!.next = [0, 0, 0];
			}
			
				if (desc!.next!.indexOf(115) != -1) console.log(` Reading: ${state} -> ${desc!.next!} `);
			
			return [...desc!.next!];
		}
		
		
		genBatchFollowers(player: number, input: StateId[]): StateId[] {
			const flatArr = input.map(x => this.getFollowers(player, x)).flat();
			return Array.from(new Set<StateId>(flatArr));
		}
		
		showTable(): void {
			const str = this.descriptors.map(x => `${x.id}, ${x.state.niceString()}`).join('\n')
			console.log(str);
		}
		
		getKeyStrings(input: StateId[]): string[] {
			return input.map(x => this.descriptors[x]!.state.keyString());
		}
		
		
	}



	export class WavefrontC extends Wavefront {
		stateSet = CardStateBundledSet.init([DEFAULT_CARDS]);
		stateBase = new StateBase();

		latest: StateId[] = [0];

		moveImpl(): void {
			console.log(`\n{${this.round},${this.playerTurn}}`);
			
			console.time('move');
			
				if (this.round == 8 && this.playerTurn == 1)
					this.stateSet = this.stateSet.moveBU_save(this.playerTurn);
				else
					this.stateSet = this.stateSet.moveBU(this.playerTurn);

			
			const newFront = this.stateBase.genBatchFollowers(this.playerTurn, this.latest);
			
			
			this.latest = newFront;
						
			console.timeEnd('move');			

				//this.stateBase.showTable();
				console.log(newFront);

				console.log(` old ${this.stateSet.size()}, num new ${this.latest.length}`);
				
				 const oldArr =	this.stateSet.toFullArray();
				
				 const oldKeyArr =	this.stateSet.toFullArray().map(x => x.keyString());
				 const newKeyArr =	this.stateBase.getKeyStrings(this.latest);
				 
				 const oldSet = new Set<string>(oldKeyArr);
				 const newSet = new Set<string>(newKeyArr);
				 
				 console.log(`Old ${oldKeyArr.length} (${oldSet.size}); New ${newKeyArr.length} (${newSet.size})`);

				 const diffSet = newSet.difference(oldSet);

					const os = oldKeyArr.map(s => CardState.fromKeyString(s).niceString());
					const ns = newKeyArr.map(s => CardState.fromKeyString(s).niceString());

					const srcStr =  '16,26,36 [02,08,13,20,24,31,39,44,53,67,75,88]    (00)[a]00000a []  (00)[9]000009 []';
					const dbStr =	'15,26,36 [02,04,13,20,24,31,39,44,53,67,75,88]    (00)[a]00000a []  (04)[3]001002 []';
					
					console.log(`Old s ${os.indexOf(srcStr)}, new ${ns.indexOf(srcStr)} `);
					console.log(`Old d ${os.indexOf(dbStr)}, new ${ns.indexOf(dbStr)} `);
					

						//console.log(this.latest[111]);
				 
				 
				// console.log([...diffSet].map(s => CardState.fromKeyString(s).niceString()));
				 
				// console.log(oldKeyArr.map(s => CardState.fromKeyString(s).niceString()));
				// console.log(newKeyArr.map(s => CardState.fromKeyString(s).niceString()));
		}
		
	}


}
