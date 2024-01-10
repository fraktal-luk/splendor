


enum Color {WHITE, BLUE, GREEN, RED, BLACK, YELLOW};

type Row = number;

type ValVector = [number, number, number, number, number, number];

type CardId = number;

class Card {
	id: CardId = 0;
	points: number = 0;
	color: Color = Color.YELLOW;
	price: ValVector = [0, 0, 0, 0, 0, 0];
	row: Row = 0;
	
	static getCard(i: number, r: number): Card {
		let res = new Card();
		res.id = i;
		res.row = r;
		return res;
	}
}

type NobleId = number;

class Noble {
	id: NobleId = 0;
	price: ValVector = [0, 0, 0, 0, 0, 0];
}

class Player {
	tokens: ValVector = [0, 0, 0, 0, 0, 0];
	owned: Card[][] = [[], [], [], [], [], []];
	reserved: Card[] = [];
	nobles: Noble[] = [];
}

class Table {
	nobles: Noble[] = [];
	stacks: Card[][] = [[], [], []];
	rows: Card[][] = [[], [], []];	
	tokens: ValVector = [0, 0, 0, 0, 0, 0];
	
	constructor(n: number) {
		if (n < 2 || n > 4) throw new Error("Wrong num of players");
		//this.nobles.push(null);
		
		for (let i: number = 0; i < 3; i++) {
			for (let j: number = 0; j < 4; j++) {
				this.rows[i][j] = Card.getCard(j + 10, i); // TMP
			}
		}
		
		const nToks = [0, 0, 4, 5, 7][n];
		for (let i: Color = Color.WHITE; i < Color.YELLOW; i++) {
			this.tokens[i] = nToks;
		}
		this.tokens[Color.YELLOW] = 5;
	}
}

class Game {
	nPlayers: number;
	players: Player[];
	table: Table;
	
	constructor(n: number) {
		this.nPlayers = n;
		this.players = [];
		for (let i: number = 0; i < n; i++)
			this.players.push(new Player());
		this.table = new Table(n);
	}
}

console.log("just begining");

//let v: ValVector = [0, 1, 1, 0, 0, 0];

//console.log(v);
//v[2]++;
//console.log(v);

let game = new Game(2);

console.log(game);
console.log(game.table);
