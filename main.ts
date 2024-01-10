


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
		//this.nobles.push(null);
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

let v: ValVector = [0, 1, 1, 0, 0, 0];

console.log(v);
v[2]++;
console.log(v);

let game = new Game(2);
