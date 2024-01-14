


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
	
	static parsePoints(s: string) {
		return parseInt(s[0]);
	}

	static parsePrice(s: string) {
		let res: ValVector = [0, 0, 0, 0, 0, 0];
		for (let i: number = 0; i < 5; i++)
			res[i] = parseInt(s[i+2]);
		return res;
	}

	static getCardStr(i: number, r:number, c: Color, s: string): Card {
		let res = new Card();
		res.id = i;
		res.row = r;
		res.color = c;
		res.points = this.parsePoints(s);
		res.price = this.parsePrice(s);
		return res;
	}
	
	static getSet(arr: string[][]): Card[] {
		let res: Card[] = [];
		let total = 1;
		
		for (let ri = 0; ri < 3; ri++) {
			const r = 3 - ri;
			const subset = arr[ri];
			for (let ci = 0; ci < subset.length; ci++) {
				res.push(Card.getCardStr(total, r, (ci % 5) as Color, subset[ci]));
				total++;
			}
		}
		
		return res;
	}
}

const cardStringList = [
// Color     W     		B     	   G     	  R     	 K
// row 3
	[  		"5:30007", "5:73000", "5:07300", "5:00730", "5:00073", 	
			"4:00007", "4:70000", "4:07000", "4:00700", "4:00070",
			"4:30036", "4:63003", "4:36300", "4:03630", "4:00363",
			"3:03353", "3:30335", "3:53033", "3:35303", "3:33530",
	],
// row 2
	[  		"3:60000", "3:06000", "3:00600", "3:00060", "3:00006", 	
			"2:00053", "2:53000", "2:05300", "2:30005", "2:00530",
			"2:00050", "2:05000", "2:00500", "2:00005", "2:50000",
			"2:00142", "2:20014", "2:42001", "2:14200", "2:01420",
			"1:23030", "1:02303", "1:30230", "1:03023", "1:30302",
			"1:00322", "1:02230", "1:23002", "1:20023", "1:32200",
	],
// row 1
	[  		"1:00400", "1:00040", "1:00004", "1:40000", "1:04000", 	
			"0:31001", "0:01310", "0:13100", "0:10013", "0:00131",
			"0:03000", "0:00003", "0:00030", "0:30000", "0:00300",
			"0:02201", "0:10220", "0:01022", "0:20102", "0:22010",
			"0:02002", "0:00202", "0:02020", "0:20020", "0:20200",
			"0:01211", "0:10121", "0:11012", "0:21101", "0:12110",
			"0:00021", "0:10002", "0:21000", "0:02100", "0:00210",
			"0:01111", "0:10111", "0:11011", "0:11101", "0:11110",
	]
];

const CARD_SET = Card.getSet(cardStringList);
const CARDS_1 = CARD_SET.filter((c: Card) => c.row == 1);
const CARDS_2 = CARD_SET.filter((c: Card) => c.row == 2);
const CARDS_3 = CARD_SET.filter((c: Card) => c.row == 3);

type NobleId = number;

class Noble {
	id: NobleId = 0;
	price: ValVector = [0, 0, 0, 0, 0, 0];
	
	static getNoble(id: number, s: string): Noble {
		let res = new Noble();
		res.id = id;
		for (let i = 0; i < 5; i++)
			res.price[i] = parseInt(s[i]);
		return res;
	}
	
	static getSet(arr: string[]): Noble[] {
		let res: Noble[] = [];
		for (let i = 0; i < arr.length; i++) {
			res.push(this.getNoble(i + 1, arr[i]));
		}
		return res;
	}
}

const nobleStringList = [
	"00044", "00440", "04400", "44000", "40004",
	"00333", "03330", "33300", "33003", "30033"
];

const NOBLES = Noble.getSet(nobleStringList);


class Player {
	tokens: ValVector = [0, 0, 0, 0, 0, 0];
	owned: Card[][] = [[], [], [], [], [], []];
	reserved: Card[] = [];
	nobles: Noble[] = [];
}

class Table {
	nobles: (Noble|null)[] = [];
	stacks: Card[][] = [[], [], []];
	rows: (Card|null)[][] = [[], [], []];	
	tokens: ValVector = [0, 0, 0, 0, 0, 0];
	
	constructor(n: number) {
		if (n < 2 || n > 4) throw new Error("Wrong num of players");
		
		const CARDS_PERM = permute(CARD_SET, permutation(90, randSeq(90)));
		const NOBLES_PERM = permute(NOBLES, permutation(10, randSeq(10)));
		
		for (let r = 0; r < 3; r++) {
			this.stacks[r] = CARDS_PERM.filter((c: Card) => c.row == r+1);
		}
		
		for (let i: number = 0; i < 3; i++) {
			for (let j: number = 0; j < 4; j++) {
				this.rows[i][j] = this.stacks[i].shift()!;
			}
		}
		
		for (let i = 0; i <= n; i++) {
			this.nobles[i] = NOBLES_PERM.shift()!;
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

function permutation(n: number, seq: number[]): number[] {
	let res: number[] = [];
	let temp: number[] = [];
	for (let i = 0; i < n; i++) {
		temp[i] = i;
	}
	
	for (let i = 0; i < n; i++) {
		res[i] = temp[seq[i]];
		temp[seq[i]] = temp[n-1-i];
	}

	return res;
}

function permute<T>(arr: T[], seq: number[]): T[] {
	let res: T[] = [];
	for (const k of seq)
	res.push(arr[k]);	
	
	return res;
}	

function randSeq(n: number): number[] {
	let range = n;
	let res: number[] = [];
	
	for (let i = 0; i < n; i++) {
		res[i] = Math.round(Math.random() * 1000000000) % range--;
	}
	
	return res;
}


console.log("just begining");

//let v: ValVector = [0, 1, 1, 0, 0, 0];

//console.log(v);
//v[2]++;
//console.log(v);

let game = new Game(2);

//console.log(game);
console.log(game.table);
console.log(game.table.rows);
console.log(game.table.nobles);
//const c0: Card = Card.getCardStr(9, 2, Color.GREEN, "3:20201");

//console.log(c0);
//console.log(CARD_SET);

//console.log(permutation(40, randSeq(40)));
//console.log(permute(CARDS_3, [0, 3, 4, 1, 2, 5]));
