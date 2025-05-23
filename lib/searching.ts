
import {
STR_1x1,
STR_2x1,
STR_1x2,
STR_1x3,
STR_1x2_1x1,
STR_3x1,
getReturns
} from './searching_base.ts';

import {cardStringList, CARD_SPECS} from './searching_base.ts';

import {getCardPrice, getCardPoints,
	take2ifPossible,
	sumState,
	minStates,
	maxStates,
	addStates,
	subStates,
	enoughStates,
	reductionForState,
	returnsForPlayer,
	statesUnique,
	states2map,
	tokStateMap,
	TokenState,
	PlayerCardState,
	TableCardState,
	CardState,
	//	ExampleNamespace
		GameStates
} from './searching_base.ts';


const PRUNE_TOKS = true;
const PRUNE_CARDS = true;//false;

function compareSG(a: StateGroup, b: StateGroup): number {
	return b.cardState.player.numOwned() - a.cardState.player.numOwned();
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
		res.tokState = statesUnique(res.tokState.concat(sg.tokState));
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
			
			if (newStateGroup.tokState.length > 0) {
				newStateGroup.tokState = statesUnique(newStateGroup.tokState);
				newStateGroup.tokStates_N = tokStateMap(newStateGroup.tokState);
				res.push(newStateGroup);
			}
		}
		
		return res;
	}
	
	nextStateGroupTake(): StateGroup {
		let res = new StateGroup();
		res.cardState = this.cardState.copy();
		
		let newTokStates: TokenState[] = [];
		
		for (const ts of this.tokState) {
			newTokStates = newTokStates.concat(ts.nextStatesUnique());
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


	next(): Wave {
		let res = new Wave();

		const followers = this.stateGroups.map(x => x.nextStates()).flat(); //  [ [...], [...], [...], ...]
		
		res.stateGroups = mergeStates(followers);
		res.stateGroups.sort(compareSG); // Sort: which state has more owned cards
		res.stateGroups.forEach(x => x.tokState.sort((a,b) => sumState(b.player) - sumState(a.player))); // Sort each state group by num of tokens  

		if (PRUNE_TOKS) res.stateGroups.forEach(pruneTokStates);
		if (PRUNE_CARDS) res.stateGroups = Wave_pruneCardStates(res);
		
		return res;
	}
	
}

function mergeStates(states: StateGroup[]): StateGroup[] {
	let map = new Map<string, StateGroup>();
	for (const f of states) {
		const s = f.cardState.player.toStr(); // TODO: this temporary solution is based only on 1 player's cards
		if (map.has(s)) map.set(s, map.get(s)!.mergeWith(f));
		else map.set(s, f);
	}
	return map.values().toArray();
}


/////////////////////////////////////////


// make new array where states are removed if they have worse cards than other state with at least equally good tokens
function TMP_cardArrSubsets(subsets: StateGroup[], supersets: StateGroup[]): StateGroup[] {
	let res: StateGroup[] = [];
	
	for (const sub of subsets) {
		let reducedTS = sub.tokState.map(x => x.copy());

		for (const larger of supersets) {
			// CAREFUL: if matching, it doesn't mean that further search is not needed.
			// A match reduces some token states from subset but there may be token states in subset that are not in superset
			const included = sub.cardState.player.isSubsetOf(larger.cardState.player);
			if (included) reducedTS = TMP_tokDiffSubsets(reducedTS, larger.tokState);
		}
		
		let copiedSG = sub.copy();
		copiedSG.tokState = reducedTS;
		res.push(copiedSG);
	}
	
	return res;
}


function Wave_pruneCardStates(wave: Wave): StateGroup[] {	
	const stateMap = Map.groupBy(wave.stateGroups, x => x.cardState.player.numOwned());
	const setSizes = stateMap.keys().toArray();
	let reduced: StateGroup[][] = [];

	for (let [subsetSize, subsetArr] of stateMap) {
		// Browse larger sets: [0:i). Remember that empty card set is legit
		for (let [supersetSize, supersetArr] of stateMap) {
			if (supersetSize > subsetSize)
				subsetArr = TMP_cardArrSubsets(subsetArr, supersetArr);
		}
		reduced.push(subsetArr);
	}
	
	return reduced.flat();
}



// TODO: inline
function pruneTokStates(sg: StateGroup): void {
	sg.tokState = TMP_tokSubsets(sg.tokState);
}



function TMP_tokArrSubsets(subsets: TokenState[], supersets: TokenState[]): TokenState[] {
	let res: TokenState[] = [];
	for (const sub of subsets) {
		let includedYet = false;
		for (const larger of supersets) {
			const included = sub.isPlayerSubsetOf(larger);
			includedYet ||= included;
		}
		if (!includedYet) res.push(sub);
	}
	return res;
}


// Make new array with only maximum player states
function TMP_tokSubsets(tokStates: TokenState[]): TokenState[] {
	let reduced: TokenState[][] = [];

	const grouped = Map.groupBy(tokStates, x => x.playerTokSum());

	for (let [subsetSize, subsetArr] of grouped) {
		// Browse larger sets: [0:i). Remember that empty card set is legit
		for (let [supersetSize, supersetArr] of grouped) {
			if (supersetSize > subsetSize) // If sizes equal, don't proceed to prevent self-elimination			
				subsetArr = TMP_tokArrSubsets(subsetArr, supersetArr); // Remove those that are dominated by something
		}
		reduced.push(subsetArr);
	}

	return reduced.flat();
}


// Make new array with states not dominated by other array
function TMP_tokDiffSubsets(tokStates: TokenState[], otherStates: TokenState[]): TokenState[] {
	let reduced: TokenState[][] = [];

	const groupedThese = Map.groupBy(tokStates, x => x.playerTokSum());
	const groupedOthers = Map.groupBy(otherStates, x => x.playerTokSum());

	for (let [subsetSize, subsetArr] of groupedThese) {
		// Browse larger sets: [0:i). Remember that empty card set is legit
		for (let [supersetSize, supersetArr] of groupedOthers) {
			if (supersetSize >= subsetSize) // Relation of inclusion is satisfied for equal sets, so here we allow equal to proceed 			
				subsetArr = TMP_tokArrSubsets(subsetArr, supersetArr); // Remove those that are dominated by something
		}
		reduced.push(subsetArr);
	}

	return reduced.flat();
}
