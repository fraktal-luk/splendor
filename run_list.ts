
import {Color, ValVector, CardId, Game, setupStacks, getCardPrice, getCardPoints, getCardColor} from './rules.ts';

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