
import {Color, ValVector, CardId, Game, setupStacks, getCardPrice, getCardPoints, getCardColor,
		vecAdd, vecSub, vecEnough, vecSum} from './rules.ts';

import {generateReturns } from './comb.ts';

const presetOrder: number[] = [
   7, 23, 52, 12, 66, 52, 74, 79, 79, 43,  7, 74,
  38,  1, 30, 51, 60, 19, 47, 59, 29, 12, 22, 27,
   3, 41, 20, 11, 13, 31, 27, 42,  1, 32,  3, 42,
  45,  1, 47,  5, 22, 38,  8, 23, 22, 25, 38, 23,
   1, 33, 39, 17, 36, 29,  0, 33, 30,  8, 25,  8,
  27, 19, 21, 22, 23, 15, 17, 14,  8, 12,  0,  3,
   3, 12, 11,  6,  3,  8,  7,  5,  0,  7,  1,  1,
   5,  3,  3,  0,  0,  0
];


let game = new Game(3, true, presetOrder);
game.dontFill = true;

console.log(game.table.str());
console.log(game.players[0]);


function playMovesSinglePlayer(commands: string[]): void {
	for (const s of commands) {
		if (game.movePlayer(0, s)) {
			console.log("Move valid: " + s);
		}
		else {
			console.log("Move not valid: " + s);
		};
		
	}

	console.log(game.table.strSh());
	//console.log(game.table.tnStr());
	console.log('');
	console.log(game.players[0].strSh(0));
	game.sumUp();
}


const moves = [
	"t wgr",
    "t grw",
    "t brk",
	"b 12",
	"b 13",
	
	"t wbg",
	"t brk",
	"b 23",
	
	"twbk",
	"twbk",
	
	"b 22",
	
	"t 2g",
	"t wbg",
	"t bgr",
	"b 34",
	
	"t 2r",
	"t r",
	"t r",
	"b 21",
	
	"t 2r",
	"b 24"
];

////////////////////////////////////////

// 1 player tree analysis
// no nobles, no reservations or gold

class TableState1 {
	tokens: ValVector = [4, 4, 4, 4, 4, 0];
	rows: CardId[][] = [[], [], []];
	stacks: CardId[][] = [];

	deepCopy(): TableState1 {
		let res = new TableState1();
		res.tokens = structuredClone(this.tokens);
		for (let i = 0; i < 3; i++)
			res.rows[i] = structuredClone(this.rows[i]);
		for (let i = 0; i < 3; i++)
			res.stacks[i] = structuredClone(this.stacks[i]);
		
		return res;
	}
	
	fillRows(): void {
		for (let r = 0; r < 3; r++)  {
			for (let c = 0; c < 4; c++)  {
				this.rows[r][c] = this.stacks[r].shift()!;
			}
		}
	}
	
	takeCard(r: number, c: number): CardId {
		const res = this.rows[r-1][c-1];
		this.rows[r-1][c-1] = this.stacks[r-1].shift()!;
		return res;
	}

	addToks(v: ValVector): void {
		for (let i = 0; i < 5; i++) {
			this.tokens[i] += v[i];
		}
	}
	
	takeToks(v: ValVector): void {
		for (let i = 0; i < 5; i++) {
			this.tokens[i] -= v[i];
		}
	}
}


class PlayerState1 {
	tokens: ValVector = [0, 0, 0, 0, 0, 0];
	bonuses: ValVector = [0, 0, 0, 0, 0, 0];
	points: number = 0;
	
	cols: CardId[][] = [[], [], [], [], []];
	
	deepCopy(): PlayerState1 {
		let res = new PlayerState1();
		res.tokens = structuredClone(this.tokens);
		res.bonuses = structuredClone(this.bonuses);
		res.points = this.points;
		for (let i = 0; i < 5; i++)
			res.cols[i] = structuredClone(this.cols[i]);
		
		return res;
	}
	
	
	addCard(id: CardId): void {
		const color = getCardColor(id);
		const points = getCardPoints(id);
		
		this.cols[color].push(id);
		this.bonuses[color]++;
		this.points += points;
	}
	
	addToks(v: ValVector): void {
		for (let i = 0; i < 5; i++) {
			this.tokens[i] += v[i];
		}
	}
	
	takeToks(v: ValVector): void {
		for (let i = 0; i < 5; i++) {
			this.tokens[i] -= v[i];
		}
	}

}

class GameState1 {
	table: TableState1 = new TableState1();
	player: PlayerState1 = new PlayerState1();
	
	deepCopy(): GameState1 {
		let res = new GameState1();
		res.table = this.table.deepCopy();
		res.player = this.player.deepCopy();
		
		return res;
	}
}


class Move1 {
	toks: ValVector = [0, 0, 0, 0, 0, 0];
}

class TakeMove1 extends Move1 {
	
}

class BuyMove1 extends Move1 {
	loc: [number, number] = [0, 0];
}



class GameNode1 {
	// game state
	state: GameState1 = new GameState1();
	
	// possible next nodes
	followers: Map<Move1, GameNode1> = new Map<Move1, GameNode1>();
	
	fillFollowers(): void {
		const player = this.state.player;
		const table = this.state.table;
		
		// all Buy moves possible
		//	 no reserved, so only from Table
		for (let r = 0; r < 3; r++) {
			for (let c = 0; c < 4; c++) {
				// get price
				const id = this.state.table.rows[r][c];
				const price = getCardPrice(id);
				
				const budget = vecAdd(this.state.player.tokens, this.state.player.bonuses);
				if (vecEnough(budget, price)) {
					console.log( r + c + "  Enough: " + budget + " for " + price);
				}
			}
		}
		
		// all Take moves possible
		const nPlayerToks = vecSum(this.state.player.tokens);

		  const surplus1 = Math.max(0, nPlayerToks + 1 - 10);		  
		  const surplus2 = Math.max(0, nPlayerToks + 2 - 10);		  
		  const surplus3 = Math.max(0, nPlayerToks + 3 - 10);
		  
		  // all threes
		  const strs3 = [
			  "00111",
			  "01110",
			  "11100",
			  "11001",
			  "10011",
			  
			  "01011",
			  "10110",
			  "01101",
			  "11010",
			  "10101",
		  ];

		  TMP_showMoves(strs3, table.tokens, surplus3 + 3);

		  // all twos
		  // all threes
		  const strs2 = [
			  "00011",
			  "00110",
			  "01100",
			  "11000",
			  "10001",
			  
			  "00101",
			  "01010",
			  "10100",
			  "01001",
			  "10010",
		  ];

		  TMP_showMoves(strs2, table.tokens, surplus2 + 2);

		  const strs1 = [
			  "00001",
			  "00010",
			  "00100",
			  "01000",
			  "10000",
		  ];

		  TMP_showMoves(strs1, table.tokens, surplus1 + 1);

		  const strs2same = [
			  "00002",
			  "00020",
			  "00200",
			  "02000",
			  "20000",
		  ];
		  
	}
}


function str2vv(s: string): ValVector {
	let res: ValVector = [0, 0, 0, 0, 0, 0];
	const n = Math.min(s.length, 6);
	for (let i = 0; i < n; i++) {
		res[i] = parseInt(s[i]);
	}
	return res;
}

// // Deal up to 3 in all ways among 2 slots with '0' in the input
// function generateReturns3(ones: ValVector, surplus: number): ValVector[] {
	// let res: ValVector[] = [];

	// // Leave out the last element cause yellow not used
	// const firstInd = ones.slice(0,5).indexOf(0);
	// const secondInd = ones.slice(0,5).lastIndexOf(0);

	// for (let firstReturn = 0; firstReturn <= surplus; firstReturn++) {
	  // const secondReturn = surplus - firstReturn;
	  
	  // let current: ValVector = [0, 0, 0, 0, 0, 0];
	  // current[firstInd] = firstReturn;
	  // current[secondInd] = secondReturn;
	  // res.push(current);
	// }

	// return res;
// }

// // Deal up to 2 among 3 slots ith '0' in the input
// function generateReturns2(ones: ValVector, surplus: number): ValVector[] {
	// let res: ValVector[] = [];

	// if (surplus == 0) {
		// return generateReturns0();
	// }

	// const firstInd = ones.slice(0,5).indexOf(1);
	// const secondInd = ones.slice(0,5).lastIndexOf(1);

	// // If surplus is 2
	// const templates = [ "011", "101", "110"];
	// // TODO: if surplus is 1, swap 1<->0 in templates
	
	// // for each of templates insert its number represenation into ValVector skipping firstInd and secondInd 
	// for (const t of templates) {
		// let ind = 0;
		// let v: ValVector = [0, 0, 0, 0, 0, 0];
		// for (const d of t) {
			// if (ind == firstInd) ind++;
			// if (ind == secondInd) ind++;
			// v[ind] = parseInt(d);
			// ind++;
		// }
		// res.push(v);
	// }

	// return res;
// }


// function generateReturns1(ones: ValVector, surplus: number): ValVector[] {
	// let res: ValVector[] = [];

	// if (surplus == 0) return generateReturns0(); 

	// const firstInd = ones.slice(0,5).indexOf(1);
	
	// // for each of templates insert its number represenation into ValVector skipping firstInd and secondInd 
	// for (let i = 1; i <= 4; i++) {
		// let ind = (firstInd + i) % 5;
		// let v: ValVector = [0, 0, 0, 0, 0, 0];
		// v[ind] = 1;
		// res.push(v);
	// }

	// return res;
// }



function TMP_showMoves(strs: string[], tableToks: ValVector, surplus: number): void {
  console.log("!!!!");
  for (const s of strs) {
	  console.log(">>>>>> " + str2vv(s));

	  // check if toks available on table
	  const vec = str2vv(s);
	  if (!vecEnough(tableToks, vec)) {
		 console.log("Table cant provide " + s); 
	  }
	  else {
		  // check all possibilities of returning the surplus
		  const returns = generateReturns(vec, surplus);

		  console.log(returns);
		  
		  // TODO: for each of returns make a move {+vec, -returns[i]} and insert to map
	  }
	  
  }
}



class MoveTree1 {
	root: GameNode1 = new GameNode1;
}

let tree = new MoveTree1();
//const initialState = 

tree.root.state.table.stacks = setupStacks(presetOrder);
tree.root.state.table.fillRows();


const player = tree.root.state.player;
const table = tree.root.state.table;


console.log(tree.root.state);
console.log(table.rows);
console.log(table.stacks);


const stateCopy = //structuredClone(tree.root.state);
					tree.root.state.deepCopy();

table.takeToks([1, 0, 0, 1, 1, 0]);
player.addToks([1, 0, 0, 1, 1, 0]);

player.addCard(table.takeCard(2, 1));

console.log(tree.root.state);
// console.log(table.rows);
// console.log(table.stacks);

console.log(stateCopy);


console.log(table.rows);
console.log(table.stacks);

//playMovesSinglePlayer(moves);
	tree.root.fillFollowers();
