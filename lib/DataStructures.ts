
import {getCardPrice, getCardPoints,} from './searching_base.ts';

import {GameStates} from './GameStates.ts';

export namespace Data {
	
	
	interface StringBacked {
		str(): string;
		//get(s: string) StringBacked;
	}

	abstract class StateDB<Element extends StringBacked> {
		content: Element[] = [];
		
		add(e: Element): void {
			this.content.push(e);
		}
		
		get(s: string): Element {
			if (s != "") return this.fromString(s);
			else return this.content[0]!;		
		}
		
		// This is the decoder of objects from string form
		abstract fromString(s: string): Element;

	}
	
	
	
	
	// // Table Tokens
	// export class TbTokState implements StringBacked {

		
	// }
	
	// // Player Tokens
	// export class PlTokState implements StringBacked {
		
	// }

	// Table Cards
	export class TbCardState implements StringBacked {
		readonly sizes: string;
		readonly row0: string;
		readonly row1: string;
		readonly row2: string;

		constructor(s: string, r0: string, r1: string, r2: string) {
			this.sizes = s;
			this.row0 = r0;
			this.row1 = r1;
			this.row2 = r2;
		}

		str(): string {
			return [this.sizes, this.row0, this.row1, this.row2].join('');
		}
	}
	
	// Player Cards
	export class PlCardState implements StringBacked {
		readonly points: number;
		readonly bonuses: string;
		
		constructor(p: number, b: string) {
			this.points = p;
			//this.nCards = b.sum();
			this.bonuses = b;
		}
		
		str(): string {
			const nCards = (new GameStates.TokenVec(this.bonuses)).sum();
			return [GameStates.numStringH(this.points), GameStates.numStringH(nCards), this.bonuses].join('');
		}		
	}
	
	
}
