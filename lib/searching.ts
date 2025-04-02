
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
} from './searching_base.ts';




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
	
	next_Repeating(): Wave {
		let res = new Wave();
		
		//  [ [...], [...], [...], ...]
		const followers = this.stateGroups.map(x => x.nextStates()).flat();
		res.stateGroups = followers;

		res.stateGroups.forEach(x => x.tokState.sort((a,b) => sumState(b.player) - sumState(a.player)));
		
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
		
		// Sort
		sortStateGroups(res.stateGroups);
		
		res.stateGroups.forEach(x => x.tokState.sort((a,b) => sumState(b.player) - sumState(a.player)));
		
		return res;
	}
	
}


function compareSG(a: StateGroup, b: StateGroup): number {
	return b.cardState.player.numOwned() - a.cardState.player.numOwned();
}

function sortStateGroups(stateGroups: StateGroup[]): void {
	stateGroups.sort(compareSG);	
}



export function TMP_cardSubsets(stateMap: Map<number, StateGroup[]>): void {	
	const setSizes = stateMap.keys().toArray();

	for (let i = 0; i < setSizes.length; i++) {
		const subsetSize = setSizes[i];
		const subsetArr = stateMap.get(subsetSize)!;

		// browse larger sets: [0:i)
		// Remember that empty card set is legit
		for (let j = 0; j < i; j++) {
			const supersetSize = setSizes[j];
			const supersetArr = stateMap.get(supersetSize)!;
			
			console.log(`${subsetSize} of ${supersetSize}`);
			
			TMP_cardArrSubsets(subsetArr, supersetArr);
		}
	}
}


function TMP_cardArrSubsets(subsets: StateGroup[], supersets: StateGroup[]): void {
	for (const sub of subsets) {
		for (const larger of supersets) {
			const included = sub.cardState.player.isSubsetOf(larger.cardState.player);
			// CAREFUL: if matching, it doesn't mean that further search is not needed.
			// A match reduces some token states from subset but there may be token states in subset that are not in superset
			console.log(`${included}: [${sub.cardState.player.toStr()}](${sub.tokState.length}) in [${larger.cardState.player.toStr()}](${larger.tokState.length})`);
		}
	}
}


export function TMP_tokSubsets(tokStates: TokenState[]): void {
	const grouped = Map.groupBy(tokStates, x => x.playerTokSum());
	const setSizes = grouped.keys().toArray();

	for (let i = 0; i < setSizes.length; i++) {
		const subsetSize = setSizes[i];
		const subsetArr = grouped.get(subsetSize)!;

		// browse larger sets: [0:i)
		// Remember that empty card set is legit
		for (let j = 0; j < i; j++) {
			const supersetSize = setSizes[j];
			const supersetArr = grouped.get(supersetSize)!;
			
			console.log(`${subsetSize} of ${supersetSize}`);
			
			TMP_tokArrSubsets(subsetArr, supersetArr);
		}
	}

}

function TMP_tokArrSubsets(subsets: TokenState[], supersets: TokenState[]): TokenState[] {
	let res: TokenState[] = [];
	for (const sub of subsets) {
		for (const larger of supersets) {
			const included = sub.isPlayerSubsetOf(larger);
			console.log(`${included}: [${sub.player}] in [${larger.player}]`);
			if (!included) res.push(sub);
		}
	}
	return res;
}
