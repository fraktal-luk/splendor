
enum Color {WHITE, BLUE, GREEN, RED, BLACK, YELLOW};

type Row = number;

type ValVector = [number, number, number, number, number, number];

// Checks if price is exact 
function satisfies(paid: ValVector, price: ValVector): boolean {
	let missing = 0;
	for (let i = 0; i < 5; i++)
		if (price[i] > paid[i]) missing += (price[i] - paid[i]);
	
	return paid[5] == missing;
}

function getRealPrice(price: ValVector, cards: Card[][]): ValVector {
	let res: ValVector = [...price];
	
	for (let i = 0; i < 5; i++)
		res[i] = Math.max(0, res[i] - cards[i].length);

	return res;
}

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

function pointStr(n: number): string {
	return n == 0 ? ' ' : n.toString();
}

function priceStrN(v: ValVector): string {
	return v.slice(0, 5).join('').replaceAll('0', ' ');
}

function priceStrC(v: ValVector): string {
	let res = 'WBGRK'.split('');
	for (let i = 0; i < 5; i++) {
		if (v[i] == 0) res[i] = ' ';
	}
	return res.join('');
}

class Player {
	tokens: ValVector = [0, 0, 0, 0, 0, 0];
	owned: Card[][] = [[], [], [], [], []];
	reserved: Card[] = [];
	nobles: Noble[] = [];
	

	tokenCardStr(): string {
		const lens = this.owned.map((ca: Card[]) => ca.length);
		return '    W  B  G  R  K  Y' + '\n' + 'T:  ' + this.tokens.join('  ') + '\n' + 'C:  ' + lens.join('  ');
	}
	
	ownedStr(): string {
		let res = '';
		const lens = this.owned.map((ca: Card[]) => ca.length);
		const maxLen = Math.max(...lens);

		for (let i = 0; i < maxLen; i++) {
			for (let j = 0; j < 5; j++) {
				if (this.owned[i].length > j)
					res += ' [P  *]'.replace('P', this.owned[i][j].points.toString());
				else
					res += '        ';
			}
			res += '\n';
		}
		
		return res;
	}
	
	reservedStr(): string {
		let hCardBorders = "|";
		const valStripStart = "|";
		const valStripCont = 
					"   |P (C)|";
		let midStrip = "|";
		
		const priceStripStart = "|";
		const priceStripCont =
					 "   |vvvvv|";

		let valStrip = valStripStart;
		let priceStripN = priceStripStart;
		let priceStripC = priceStripStart;
		
		for (let i = 0; i < this.reserved.length; i++) {
			const card = this.reserved[i];
			hCardBorders += "    ----- ";
			valStrip += valStripCont.replace('P', pointStr(card.points)).replace('C', Color[card.color][0]);
			priceStripN += priceStripCont.replace('vvvvv', priceStrN(card.price));
			priceStripC += priceStripCont.replace('vvvvv', priceStrC(card.price));
		}
		
		return [hCardBorders, valStrip, midStrip, priceStripN, priceStripC, hCardBorders].join('\n');			
	}

	nobleStr(): string {
		let border = '';
		let costN = '';
		let costC = '';
		
		for (let i = 0; i < this.nobles.length; i++) {			
			border += "    ----- ";
			costN += ('   |' + priceStrN(this.nobles[i]!.price) +'|');
			costC += ('   |' + priceStrC(this.nobles[i]!.price) +'|');
		}

		return [border, costN, costC, border].join('\n');
	}
	
	str(k: number): string {
		return  "-----------------------------------------\n" +
				"------- Player " + k.toString() + " ------\n" +
				this.nobleStr() + '\n' +
				this.tokenCardStr() + '\n' +
				this.ownedStr() + '\n' +
				this.reservedStr() + '\n' +
				"------- ------ --" + " ------\n" +
				"------- ------ --" + " ------\n";
	}
	
	// Checks whether limit of 10 won't be exceeded and the player won't overspend
	canGet(take: ValVector, give?: ValVector): boolean {
		let newVec: ValVector = [...this.tokens];
		if (give == undefined) give = [0, 0, 0, 0, 0, 0];
		
		let sum = 0; 
		for (let i = 0; i < 6; i++ ) {
			newVec[i] += take[i];
			newVec[i] -= give[i];
			
			if (newVec[i] < 0) return false;
			
			sum += newVec[i];
		}
		
		return sum <= 10;
	}
	
	getTokens(take: ValVector, give?: ValVector): void {
		if (give == undefined) give = [0, 0, 0, 0, 0, 0];
		
		for (let i = 0; i < 6; i++ ) {
			this.tokens[i] += take[i];
			this.tokens[i] -= give[i];
		}
	}
	
	addCard(c: Card): void {
		this.owned[c.color].push(c);
	}
	
}

class Table {
	nobles: (Noble|undefined)[] = [];
	stacks: Card[][] = [[], [], []];
	rows: (Card|undefined)[][] = [[], [], []];	
	tokens: ValVector = [0, 0, 0, 0, 0, 0];
	
	constructor(n: number) {
		if (n < 2 || n > 4) throw new Error("Wrong num of players");
		
		const CARDS_PERM = permute(CARD_SET, permutation(90, randSeq(90)));
		const NOBLES_PERM = permute(NOBLES, permutation(10, randSeq(10)));
		
		for (let r = 0; r < 3; r++)
			this.stacks[r] = CARDS_PERM.filter((c: Card) => c.row == r+1);
		
		for (let i: number = 0; i < 3; i++)
			for (let j: number = 0; j < 4; j++)
				this.rows[i][j] = this.stacks[i].shift()!;
		
		for (let i = 0; i <= n; i++) this.nobles[i] = NOBLES_PERM.shift()!;

		const nToks = [0, 0, 4, 5, 7][n];
		for (let i: Color = Color.WHITE; i < Color.YELLOW; i++) this.tokens[i] = nToks;
		this.tokens[Color.YELLOW] = 5;
	}
	
	
	takeCard(loc: number[]): Card | undefined {
		if (loc[0] < 1 || loc[0] > 3) throw new Error('Invalid row number');
		if (loc[1] < 0 || loc[1] > 4) throw new Error('Invalid col number');
		
		if (loc[1] == 0) return this.stacks[loc[0]-1].shift(); // Taking from stack
		
		const res = this.rows[loc[0]-1][loc[1]-1];
		this.rows[loc[0]-1][loc[1]-1] = undefined;
		this.rows[loc[0]-1][loc[1]-1] = this.stacks[loc[0]-1].shift();
		return res;
	}
	
	canTake(v: ValVector): boolean {
		for (let i = 0; i < 5; i++) {
			if (v[i] == 2 && this.tokens[i] < 4) return false;
			if (v[i] > this.tokens[i]) return false;
		}
		return true;
	}

	takeTokens(v: ValVector): void {
		for (let i = 0; i < v.length; i++) this.tokens[i] -= v[i];
	}

	putTokens(v: ValVector): void {
		for (let i = 0; i < v.length; i++) this.tokens[i] += v[i];
	}

	takeNoble(k: number): Noble | undefined {
		
		return undefined;
	}	

	tokenStr(): string {
		return '\n' + '   W B G R K Y' + '\n' + '   ' + this.tokens.join(' ');
	}

	nobleStr(): string {
		/*
		"|   --A--     -----     -----     -----  ",
		"|  |('_')|   |5 (G)|   |5 (G)|   |5 (G)| ",
		"|  |/| |\|   |     |   |     |   |     | ",
		"|  |.....|   |.....|   |.....|   |.....| ",
		"|  |.....|   |.....|   |.....|   |.....| ",
		"|   -----     -----     -----     -----  ",
		
		*/
		
		let border = '';
		let costN = '';
		let costC = '';
		
		for (let i = 0; i < this.nobles.length; i++) {
			if (this.nobles[i] != undefined) {
				border += "    ----- ";
				costN += ('   |' + priceStrN(this.nobles[i]!.price) +'|');
				costC += ('   |' + priceStrC(this.nobles[i]!.price) +'|');
			}
			else {
				border +=  "          ";
				costN +=  "          ";
				costC +=  "          ";
			}
		}
		
		return [border, costN, costC, border].join('\n');
	}

	rowStr(row: number): string {
		const template =
		[
		" --------------------------------------------------- ",
		"|     -----     -----     -----     -----     -----  ",
		"|    |XXXXX|   |5 (G)|   |5 (G)|   |5 (G)|   |5 (G)| ",
		"| 16 |XXXXX|   |     |   |     |   |     |   |     | ",
		"|    |XXXXX|   |.....|   |.....|   |.....|   |.....| ",
		"|     -----     -----     -----     -----     -----  ",
		"|                                                    ",
		"|     -----     -----     -----     -----     -----  ",
		"|    |XXXXX|   |5 (G)|   |5 (G)|   |5 (G)|   |5 (G)| ",
		"| 26 |XXXXX|   |     |   |     |   |     |   |     | ",
		"|    |XXXXX|   |.....|   |.....|   |.....|   |.....| ",
		"|     -----     -----     -----     -----     -----  ",
		"|                                                    ",
		"|     -----     -----     -----     -----     -----  ",
		"|    |XXXXX|   |5 (G)|   |5 (G)|   |5 (G)|   |5 (G)| ",
		"| 36 |XXXXX|   |     |   |     |   |     |   |     | ",
		"|    |XXXXX|   |.....|   |.....|   |.....|   |.....| ",
		"|     -----     -----     -----     -----     -----  ",
		" --------------------------------------------------- ",
		"|   (W)   (B)   (G)   (R)   (K)    (Y)               ",
		"|    4     4     4     4     4      5                ",
		" --------------------------------------------------- ",
		].join('\n');

		const hCardBorders =
		"|     -----     -----     -----     -----     -----  ";
		const valStripStart =
		"|    |XXXXX|";
		const valStripCont = 
					"   |P (C)|";
		let midStrip = 
		"| NN |XXXXX|   |     |   |     |   |     |   |     | ";
		
		const priceStripStart =
		"|    |XXXXX|";
		const priceStripCont =
					 "   |vvvvv|";

		let valStrip = valStripStart;
		let priceStripN = priceStripStart;
		let priceStripC = priceStripStart;
		
		const r = row;
		for (let i = 0; i < 4; i++) {
			const card = this.rows[r][i]!;
			valStrip += valStripCont.replace('P', pointStr(card.points)).replace('C', Color[card.color][0]);
			priceStripN += priceStripCont.replace('vvvvv', priceStrN(card.price));
			priceStripC += priceStripCont.replace('vvvvv', priceStrC(card.price));
		}
		
		midStrip = midStrip.replace('NN', (this.stacks[r].length + 100).toString().substr(1));
		
		return [hCardBorders, valStrip, midStrip, priceStripN, priceStripC, hCardBorders].join('\n');
	}
	
	str(): string {
		return  "-----------------------------\n" +
				"---------- Table ------------\n" +
				this.nobleStr() + '\n' +
				this.rowStr(2) + '\n' +
				this.rowStr(1) + '\n' +
				this.rowStr(0) + '\n' +
				"--------------------------\n" +
				this.tokenStr() + '\n' +
				"--------------------------\n" +
				"--------------------------\n";
	}

}


class Game {
	nPlayers: number;
	players: Player[];
	table: Table;
	
	turn: number;

	constructor(n: number) {
		this.nPlayers = n;
		this.players = [];
		for (let i: number = 0; i < n; i++)
			this.players.push(new Player());
		this.table = new Table(n);
		
		this.turn = 0;
	}
	
	move(s: string): void {
		
		
		this.turn = (this.turn+1) % this.nPlayers;
	}


	moveTake(k: number, c: Command): void {
		let player = this.players[k];
		if (!validateTake(c.take!)) {
			console.log('Incorrect Take');
			return;
		}
		
		if (!this.table.canTake(c.take!)) {
			console.log('Not enough on table');
			return;
		}
		
		if (!player.canGet(c.take!, c.give)) {
			console.log('Wrong number of tokens remaining on player');
			return;
		}
	
		this.table.takeTokens(c.take!);
		if (c.give != undefined) this.table.putTokens(c.give!);
	
		player.getTokens(c.take!, c.give);
	}


	moveBuy(k: number, c: Command): void {
		let player = this.players[k];
	
		const card = this.table.rows[c.loc![0]-1][c.loc![1]-1];
		if (card == undefined) throw new Error('No card!');
		
		const realPrice = getRealPrice(card!.price, player.owned);
		
		const pay = (c.give == undefined) ? realPrice : c.give!;
		//const payEffective = 
		
		// pay must satisfy card price
			console.log(pay);
			console.log(realPrice);
		
		if (!satisfies(pay, realPrice)) {
			console.log('Not paying exact');
			return;
		}
		
		// pay must be affordable to the player
		if (!player.canGet([0, 0, 0, 0, 0, 0], pay)) {
			console.log('Wrong number of tokens remaining on player');
			return;
		}
	
		player.getTokens([0, 0, 0, 0, 0, 0], pay);
		this.table.putTokens(pay);
		
		const taken = this.table.takeCard(c.loc!)!;
		player.addCard(taken);
	}


	movePlayer(k: number, s: string): void {
		let player = this.players[k];
		const command = parseMove(s);
		
				console.log(command);

		
		switch (command.kind) {
		case 'take':
			this.moveTake(k, command);
		break;
		case 'buy':
			this.moveBuy(k, command);
		break;
		case 'reserve':
		
		break;
		}
		
	}

}

function permutation(n: number, seq: number[]): number[] {
	let res: number[] = [];
	let temp: number[] = [];
	for (let i = 0; i < n; i++) temp[i] = i;
	
	for (let i = 0; i < n; i++) {
		res[i] = temp[seq[i]];
		temp[seq[i]] = temp[n-1-i];
	}

	return res;
}

function permute<T>(arr: T[], seq: number[]): T[] {
	let res: T[] = [];
	for (const k of seq) res.push(arr[k]);	
	
	return res;
}	

function randSeq(n: number): number[] {
	let range = n;
	let res: number[] = [];

	for (let i = 0; i < n; i++) res[i] = Math.round(Math.random() * 1000000000) % range--;
	
	return res;
}

type Kind = 'take' | 'buy' | 'reserve';

class Command {
	
	kind: Kind = 'take';
	loc?: number[];
	take?: ValVector;
	give?: ValVector;
	noble?: number;
};

function parseMove(s: string): Command {
	let sFilt = s.split('').filter((s) => s != ' ');
	sFilt.push('\n');

	if (sFilt.length == 0) throw new Error("empty command");
	
	switch (sFilt[0]) {
	case "t": 
		return parseTake(sFilt);
	break;
	case "b":
		return parseBuy(sFilt);
	break;
	case "r":
		return parseReserve(sFilt);
	break;
	default: throw new Error("Command wrong beginning");
	}
}


function parseTake(s: string[]): Command {	
	let res = new Command();
	
	res.kind = 'take';
	
	s.shift(); // "t"
	res.take = parseTokenList(s);
	
	if (s[0] == '-') {
		s.shift();
		res.give = parseTokenList(s);
	}
	
	res.noble = parseOptNoble(s);
	
	if (s[0] != '\n') throw new Error("Incorrect parse");
	
	return res;
}

function parseBuy(s: string[]): Command {
	let res = new Command();
	
	res.kind = 'buy';
	
	s.shift(); // "b"
	res.loc = parseLoc(s);
	
	if (s[0] == 'p') {
		s.shift();
		res.give = parseTokenList(s);
	}

	res.noble = parseOptNoble(s);
	
	if (s[0] != '\n') throw new Error("Incorrect parse");
	
	return res;
}


function parseReserve(s: string[]): Command {
	let res = new Command();
	
	res.kind = 'reserve';
	
	s.shift(); // "r"
	res.loc = parseLoc(s);
	
	if (s[0] == '-') {
		s.shift();
		res.give = parseTokenList(s);
	}

	res.noble = parseOptNoble(s);
	
	if (s[0] != '\n') throw new Error("Incorrect parse");
	
	return res;
}

function letter2color(s: string): Color {
	return 'wbgrky'.indexOf(s[0]);
}	

function parseTokenList(s: string[]): ValVector {
	let res: ValVector = [0, 0, 0, 0, 0, 0];
	let numStr = '';
	while ('0123456789wbgrky'.includes(s[0])) {
		if ('0123456789'.includes(s[0])) {
			if (numStr.length > 0) throw new Error("number after number!");
			numStr = s.shift()!;
		}
		else if ('wbgrky'.includes(s[0])) {			
			const color = letter2color(s.shift()!);			
			const num = numStr.length > 0 ? parseInt(numStr) : 1;
			res[color] += num;

			numStr = '';
		}
		//else {
		//	return res;
		//}
	}
	
	return res;
}

function parseLoc(s: string[]): number[] {
	let locStr = '';
	
	if ('0123r'.includes(s[0])) locStr += s.shift();
	else throw new Error('Wrong location');
	
	if ('01234'.includes(s[0])) locStr += s.shift();
	else throw new Error('Wrong location');
		
	let res = [0, 0];
	if (locStr[0] == 'r') res[0] = 0;
	else res[0] = parseInt(locStr[0]);
	
	res[1] = parseInt(locStr[1]);
	
	return res;
}

function parseOptNoble(s: string[]): number | undefined {
	if (s[0] == 'n') {
		s.shift();
		if ('0123456789'.includes(s[0])) return parseInt(s.shift()!);

		throw new Error("no number for noble!");
	}
	return undefined;
}


function validateTake(v: ValVector): boolean {
	let sum = 0;
	for (let i = 0; i < v.length; i++) {
		sum += v[i];
	}
	
	if (sum > 3) return false;
	if (v[5] > 0) return false;

	for (let i = 0; i < v.length; i++) {
		if (v[i] < 0) return false;
		if (v[i] > 2) return false;
		if (v[i] == 2 && sum > 2) return false;
	}

	return true;
}


let game = new Game(2);

console.log(game.players[0]);

parseMove("t 1w 2k r- wwk n2");
parseMove("b 11 ");
parseMove("r 1 2 -b n3");



console.log(game.table.str());
console.log('');
console.log('');

console.log(game.players[0].str(0));

game.movePlayer(0, "t wkr");
game.movePlayer(0, "t bgr");
game.movePlayer(0, "t wbg");

console.log(game.table.str());
console.log('');
console.log(game.players[0].str(0));

game.movePlayer(0, "t wwr");

console.log(game.table.str());
console.log('');
console.log(game.players[0].str(0));

game.movePlayer(0, "b 11");

console.log(game.table.str());
console.log('');
console.log(game.players[0].str(0));
