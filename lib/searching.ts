
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
