
enum Color {WHITE, BLUE, GREEN, RED, BLACK, YELLOW};

function color2char(c: Color): string {
	return 'WBGRKY'[c];
}

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
	//	"00022", "00220", "02200", "22000", "20002",
	//	"00111", "01110", "11100", "11001", "10011"
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
	
	points(): number {
		let sum = 0;
		for (const col of this.owned) {
			for (const card of col)
				sum += card.points;
		}
		return sum + 3*this.nobles.length;
	}

	numCards(): number {
		let sum = 0;
		for (const col of this.owned) {
			sum += col.length;
		}
		return sum;
	}
	
	bonuses(): ValVector {
		let res: ValVector = [0, 0, 0, 0, 0, 0];
		for (let i = 0; i < 5; i++) {
			res[i] = this.owned[i].length;
		}
		return res;
	}

	
	tcrStr(): string {
		const tcS = this.tokenCardStr().split('\n');
		const rS = this.reservedStr().split('\n');
		
		return  '                       ' + rS[0] + '\n' +
				tcS[0] + rS[1] + '\n' + tcS[1] + rS[2] + '\n' + tcS[2] + rS[3] + '\n' +
				'                       ' + rS[4] + '\n';
	}
	
	tokenCardStr(): string {
		const lens = this.owned.map((ca: Card[]) => ca.length);
		return '    W  B  G  R  K  Y   ' + '\n' + 'T:  ' + this.tokens.join('  ') + '   ' + '\n' + 'C:  ' + lens.join('  ') + '   ' + '   ';
	}
	
	ownedStr(): string {
		let res = '';
		const lens = this.owned.map((ca: Card[]) => ca.length);
		const maxLen = Math.max(...lens);

		for (let i = 0; i < maxLen; i++) {
			for (let j = 0; j < 5; j++) {
				if (this.owned[j].length > i)
					res += ' [P  *]'.replace('P', pointStr(this.owned[j][i].points));
				else
					res += '       ';
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
			valStrip += valStripCont.replace('P', pointStr(card.points)).replace('C', color2char(card.color));
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

	strSh(k: number): string {
		return  "------- Player " + k.toString() + " ------\n" +
				this.nobleStr() + '\n' +
				this.tcrStr() + '\n' +
				this.ownedStr() + '\n' +
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
	
	canReserve(take: ValVector, give?: ValVector): boolean {
		if (this.reserved.length >= 3) return false;
		else return this.canGet(take, give);
	}

	addTokens(take: ValVector, give?: ValVector): void {
		if (give == undefined) give = [0, 0, 0, 0, 0, 0];
		
		for (let i = 0; i < 6; i++ ) {
			this.tokens[i] += take[i];
			this.tokens[i] -= give[i];
		}
	}

	seeReserved(loc: number[]): Card {
		return this.reserved[loc[1]-1]!;
	}

	takeReserved(loc: number[]): Card {
		const res = this.reserved[loc[1]-1]!;
		this.reserved.splice(loc[1]-1, 1); // delete it
		return res;
	}
	
	addCard(c: Card): void {
		this.owned[c.color].push(c);
	}
	
	reserveCard(c: Card): void {
		this.reserved.push(c);
	}
	
	addNoble(n: Noble): void {
		this.nobles.push(n);
	}
	
}

class Table {
	nobles: (Noble|undefined)[] = [];
	stacks: Card[][] = [[], [], []];
	rows: (Card|undefined)[][] = [[], [], []];	
	tokens: ValVector = [0, 0, 0, 0, 0, 0];
	
	constructor(n: number, noNobles: boolean = false, presetOrder?: number[]) {
		if (n < 2 || n > 4) throw new Error("Wrong num of players");
				
		const  cardOrder = presetOrder ?? randSeq(90);
				console.log(cardOrder);
				
		const CARD_SEQ = permute(CARD_SET, permutation(90, cardOrder));
		const NOBLES_PERM = permute(NOBLES, permutation(10, randSeq(10)));
		
		for (let r = 0; r < 3; r++)
			this.stacks[r] = CARD_SEQ.filter((c: Card) => c.row == r+1);
		
		for (let i: number = 0; i < 3; i++)
			for (let j: number = 0; j < 4; j++)
				this.rows[i][j] = this.stacks[i].shift()!;
		
		if (!noNobles) for (let i = 0; i <= n; i++) this.nobles[i] = NOBLES_PERM.shift()!;

		const nToks = [0, 0, 4, 5, 7][n];
		for (let i: Color = Color.WHITE; i < Color.YELLOW; i++) this.tokens[i] = nToks;
		this.tokens[Color.YELLOW] = 5;
	}
	

	seeCard(loc: number[]): Card | undefined {
		if (loc[0] < 1 || loc[0] > 3) throw new Error('Invalid row number');
		if (loc[1] < 0 || loc[1] > 4) throw new Error('Invalid col number');
		
		if (loc[1] == 0) return this.stacks[loc[0]-1][0]; // Taking from stack

		return this.rows[loc[0]-1][loc[1]-1];
	}

	takeCard(loc: number[], dontFill: boolean = false): Card | undefined {
		if (loc[0] < 1 || loc[0] > 3) throw new Error('Invalid row number');
		if (loc[1] < 0 || loc[1] > 4) throw new Error('Invalid col number');
		
		if (loc[1] == 0) return this.stacks[loc[0]-1].shift(); // Taking from stack
		
		const res = this.rows[loc[0]-1][loc[1]-1];
		this.rows[loc[0]-1][loc[1]-1] = undefined;
		if (!dontFill) this.rows[loc[0]-1][loc[1]-1] = this.stacks[loc[0]-1].shift();
				
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
		const res = this.nobles[k-1];
		this.nobles[k-1] = undefined;		
		return res;
	}	

	tokenStr(): string {
		return '\n' + '   W B G R K Y' + '\n' + '   ' + this.tokens.join(' ');
	}

	nobleStr(): string {		
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
				border += "          ";
				costN +=  "          ";
				costC +=  "          ";
			}
		}
		
		return [border, costN, costC, border].join('\n');
	}

	rowStr(row: number): string {

		const hCardBorders =
		"|-----   -----   -----   -----   -----  ";
		const valStripStart =
		"|  NN |";
		const valStripCont = 
					" |P (C)|";
		const priceStripStart =
		"|.....|";
		const priceStripCont =
					 " |vvvvv|";

		const r = row;

		let valStrip = valStripStart.replace('NN', (this.stacks[r].length + 100).toString().substr(1));
		let priceStripN = priceStripStart;
		let priceStripC = priceStripStart;
		
		for (let i = 0; i < 4; i++) {			
			const card = this.rows[r][i];
			
			let colorLetter = " ";
			let points = 0;
			let price: ValVector = [0, 0, 0, 0, 0, 0];
			if (card == undefined) {
			}
			else {
				colorLetter = color2char(card.color);
				points = card.points;
				price = card.price;
			}
			
			valStrip += valStripCont.replace('P', pointStr(points)).replace('C', colorLetter);
			priceStripN += priceStripCont.replace('vvvvv', priceStrN(price));
			priceStripC += priceStripCont.replace('vvvvv', priceStrC(price));
		}
				
		return [hCardBorders, valStrip, priceStripN, priceStripC, hCardBorders].join('\n');
	}
	
	str(): string {
		return  "---------- Table ------------\n" +
				this.nobleStr() + '\n' +
				this.rowStr(2) + '\n' +
				this.rowStr(1) + '\n' +
				this.rowStr(0) + '\n' +
				"--------------------------\n" +
				this.tokenStr() + '\n' +
				"--------------------------\n";
	}

	strSh(): string {
		return  "---------- Table ------------\n" +
				this.rowStr(2) + '\n' +
				this.rowStr(1) + '\n' +
				this.rowStr(0) + '\n' +
				"--------------------------\n" +
				this.tnStr() + '\n' +
				"--------------------------\n";
	}

	tnStr(): string {
		const tS = this.tokenStr().split('\n');
		const nS = this.nobleStr().split('\n');
		return  '              ' + nS[0] + '\n' + tS[1] + nS[1] + '\n' + tS[2] + nS[2] + '\n' +
				'              ' + nS[3];
	}

}

export
class Game {
	nPlayers: number;
	players: Player[];
	table: Table;
	
	turn: number;

	dontFill: boolean = false;

	constructor(n: number, noNobs: boolean = false, presetOrder?: number[]) {
		this.nPlayers = n;
		this.players = [];
		for (let i: number = 0; i < n; i++)
			this.players.push(new Player());
		this.table = new Table(n, noNobs, presetOrder);
		
		this.turn = 0;
	}
	
	nextPlayer(s: string): void {
		this.turn = (this.turn+1) % this.nPlayers;
	}

	handleNoble(p: Player, c: Command): void {
		if (c.noble != undefined) {
			const nob = this.table.takeNoble(c.noble!)!;
			p.addNoble(nob);
		}
	}
	
	
	
	validateTake(k: number, c: Command): boolean {
		let player = this.players[k];

		// Validation part
		if (!verifyTake(c.take!)) {
			console.log('Incorrect Take');
			return false;
		}
		
		if (!this.table.canTake(c.take!)) {
			console.log('Not enough on table');
			return false;
		}
		
		if (!player.canGet(c.take!, c.give)) {
			console.log('Wrong number of tokens remaining on player');
			return false;
		}
	
		// Check noble
		//..
			let bonuses = player.bonuses();
		
			let availableNobs: number[] = []; 
			for (let i = 0; i < this.table.nobles.length; i++) {
				if (this.table.nobles[i] == undefined) continue;
				if (satisfies(bonuses, this.table.nobles[i]!.price)) {
					availableNobs.push(i+1);
				}
			}
			
			if (availableNobs.length > 0) console.log('Will afford nobles: ' + availableNobs);
		
			if (availableNobs.length != 0 && c.noble == undefined) {
				console.log('Noble not specified!');
				return false;
			}
			if (c.noble != undefined && !availableNobs.includes(c.noble!)) {
				console.log('Incorrect noble specified!');
				return false;
			}

		
		return true;
	}


	moveTake(k: number, c: Command): boolean {
		let player = this.players[k];

		if (!this.validateTake(k, c)) return false;

		// Execution part

		this.table.takeTokens(c.take!);
		if (c.give != undefined) this.table.putTokens(c.give!);
	
		player.addTokens(c.take!, c.give);
		
		// if (c.noble != undefined) {
			// const nob = this.table.takeNoble(c.noble!)!;
			// player.addNoble(nob);
		// }
		
		this.handleNoble(player, c);
		
		return true;
	}


	validateBuy(k: number, c: Command): boolean {
		let player = this.players[k];
		
		const fromReserve = (c.loc![0] == 0);
	
		// Validation part
		const card = fromReserve ? 
							player.reserved[c.loc![1]-1]	:	this.table.rows[c.loc![0]-1][c.loc![1]-1];
		if (card == undefined) {///throw new Error('No card!');
			console.log("No card!");			
			return false;
		}
		const realPrice = getRealPrice(card!.price, player.owned);
		
		const pay = (c.give == undefined) ? realPrice : c.give!;
		
		// pay must satisfy card price
			console.log(pay);
			console.log(realPrice);
		
		if (!satisfies(pay, realPrice)) {
			console.log('Not paying exact');
			return false;
		}
		
		// pay must be affordable to the player
		if (!player.canGet([0, 0, 0, 0, 0, 0], pay)) {
			console.log('Wrong number of tokens remaining on player');
			return false;
		}
		
		
		

		// Check noble
		//..
		const seen = fromReserve ? 
							  player.seeReserved(c.loc!) : this.table.seeCard(c.loc!)!;
							  
			let bonuses = player.bonuses();
			bonuses[seen.color]++;
		
			let availableNobs: number[] = []; 
			for (let i = 0; i < this.table.nobles.length; i++) {
				if (this.table.nobles[i] == undefined) continue;
				if (satisfies(bonuses, this.table.nobles[i]!.price)) {
					availableNobs.push(i+1);
				}
			}
			
			if (availableNobs.length > 0) console.log('Will afford nobles: ' + availableNobs);
		
			if (availableNobs.length != 0 && c.noble == undefined) {
				console.log('Noble not specified!');
				return false;
			}
			if (c.noble != undefined && !availableNobs.includes(c.noble!)) {
				console.log('Incorrect noble specified!');
				return false;
			}

		return true;
	}


	moveBuy(k: number, c: Command): boolean {
		let player = this.players[k];

		if (!this.validateBuy(k, c)) return false;

	
		const fromReserve = (c.loc![0] == 0);
	
		const card = fromReserve ? 
							player.reserved[c.loc![1]-1]	:	this.table.rows[c.loc![0]-1][c.loc![1]-1];
		const realPrice = getRealPrice(card!.price, player.owned);
		const pay = (c.give == undefined) ? realPrice : c.give!;

		// Execution part
		const taken = fromReserve ? 
							  player.takeReserved(c.loc!) : this.table.takeCard(c.loc!, this.dontFill)!;				  

		player.addTokens([0, 0, 0, 0, 0, 0], pay);
		this.table.putTokens(pay);
		
		player.addCard(taken);

		// if (c.noble != undefined) {
			// const nob = this.table.takeNoble(c.noble!)!;
			// player.addNoble(nob);
		// }

		this.handleNoble(player, c);
	
		return true;
	}

	

	validateReserve(k: number, c: Command): boolean {
		let player = this.players[k];

		const card = (c.loc![1] == 0) ?
					   this.table.stacks[c.loc![0]-1].at(-1)	: this.table.rows[c.loc![0]-1][c.loc![1]-1];
		const take: ValVector = (this.table.tokens[Color.YELLOW] > 0) ? [0, 0, 0, 0, 0, 1] : [0, 0, 0, 0, 0, 0];
		
		if (card == undefined) {
			console.log("No card!");
			return false;
		}
		
		if (!player.canReserve(take, c.give)) {
			console.log('Wrong number of tokens remaining on player or 3 reserved');
			return false;
		}

		// Check noble
		//..
			let bonuses = player.bonuses();
		
			let availableNobs: number[] = []; 
			for (let i = 0; i < this.table.nobles.length; i++) {
				if (this.table.nobles[i] == undefined) continue;
				if (satisfies(bonuses, this.table.nobles[i]!.price)) {
					availableNobs.push(i+1);
				}
			}
			
			if (availableNobs.length > 0) console.log('Will afford nobles: ' + availableNobs);
		
			if (availableNobs.length != 0 && c.noble == undefined) {
				console.log('Noble not specified!');
				return false;
			}
			if (c.noble != undefined && !availableNobs.includes(c.noble!)) {
				console.log('Incorrect noble specified!');
				return false;
			}

		
		return true;
	}


	moveReserve(k: number, c: Command): boolean {
		let player = this.players[k];

		const card = (c.loc![1] == 0) ?
					   this.table.stacks[c.loc![0]-1].at(-1)	: this.table.rows[c.loc![0]-1][c.loc![1]-1];
		const take: ValVector = (this.table.tokens[Color.YELLOW] > 0) ? [0, 0, 0, 0, 0, 1] : [0, 0, 0, 0, 0, 0];


		if (!this.validateReserve(k, c)) return false;

		// Execution part
		const taken = this.table.takeCard(c.loc!, this.dontFill)!;
		player.reserveCard(taken);

		this.table.takeTokens(take);
		if (c.give != undefined) this.table.putTokens(c.give!);
	
		player.addTokens(take, c.give);

		// if (c.noble != undefined) {
			// const nob = this.table.takeNoble(c.noble!)!;
			// player.addNoble(nob);
		// }

		this.handleNoble(player, c);

		return true;
		
	}


	movePlayer(k: number, s: string): boolean {
		let player = this.players[k];
		const command = parseMove(s);
		
				console.log(command);
		
		switch (command.kind) {
		case 'take':
			return this.moveTake(k, command);
		break;
		case 'buy':
			return this.moveBuy(k, command);
		break;
		case 'reserve':
			return this.moveReserve(k, command);
		break;
		default:
			console.log('Command not correct');
			return false;
		}
		
	}


	sumUp(): void {
		let pointVec: number[] = [];
		let cardVec: number[] = [];
		let maxPointVec: boolean[] = [];

		for (let i = 0; i < this.players.length; i++) {
			pointVec.push(this.players[i].points());
			cardVec.push(this.players[i].numCards());
		}
		
		let minCards = Math.max(...cardVec);
		
		console.log('Points per player: ' + pointVec);
		const maxPoints = Math.max(...pointVec);
		//const haveMax = this.players.filter((p: Player) => p.points() == maxPoints);
		//haveMax.map((p: Player) => p.numCards())
		for (let i = 0; i < this.players.length; i++) {
			if (pointVec[i] == maxPoints) {
				maxPointVec.push(true);
				minCards = Math.min(minCards, this.players[i].numCards());
			}
			else {
				maxPointVec.push(false);
			}
		}
		
		let winners: number[] = [];
		for (let i = 0; i < this.players.length; i++) {
			if (this.players[i].points() == maxPoints && this.players[i].numCards() == minCards) {
				winners.push(i);
			}
		}
		
		if (maxPoints >= 15) console.log('15 reached!');
		console.log('Leading players: ' + winners);
	}


	// Check if game state is correct
	validate(): boolean {
		// TODO
		// Check: every player <= 10 tokens, all cards are somewhere and dont repeat, total nums of token colors, etc.
		
		
		return false;
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

	kind?: Kind = undefined;
	loc?: number[];
	take?: ValVector;
	give?: ValVector;
	noble?: number;
};

function parseMove(s: string): Command {
	let sFilt = s.split('').filter((s) => s != ' ');
	sFilt.push('\n');

	if (sFilt.length == 0) {//throw new Error("empty command");
		console.log('Command empty');
		return new Command();
	}
	
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
	default: //throw new Error("Command wrong beginning");
		console.log('Command wrong beginning');
		return new Command();
	}
}


function parseTake(s: string[]): Command {	
	let res = new Command();
	
	res.kind = 'take';
	
	s.shift(); // "t"
	res.take = parseTokenList(s);
	if (res.take == undefined) {
		console.log("Wrong token list");
		return new Command();
	}
	
	if (s[0] == '-') {
		s.shift();
		res.give = parseTokenList(s);
		if (res.give == undefined) {
			console.log("Wrong token list");
			return new Command();
		}
	}
	
	res.noble = parseOptNoble(s);
	
	if (s[0] != '\n') {//throw new Error("Incorrect parse");
		console.log("Incorrect parse");
		return new Command();
	}
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
		if (res.give == undefined) {
			console.log("Wrong token list");
			return new Command();
		}
	}

	res.noble = parseOptNoble(s);
	
	if (s[0] != '\n') {//throw new Error("Incorrect parse");
		console.log("Incorrect parse");
		return new Command();
	}	
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
		if (res.give == undefined) {
			console.log("Wrong token list");
			return new Command();
		}
	}

	res.noble = parseOptNoble(s);
	
	if (s[0] != '\n') {//throw new Error("Incorrect parse");
		console.log("Incorrect parse");
		return new Command();
	}	
	return res;
}

function letter2color(s: string): Color {
	return 'wbgrky'.indexOf(s[0]);
}	

function parseTokenList(s: string[]): ValVector | undefined {
	let res: ValVector = [0, 0, 0, 0, 0, 0];
	let numStr = '';
	let anyColor = false;
	while ('0123456789wbgrky'.includes(s[0])) {
		if ('0123456789'.includes(s[0])) {
			if (numStr.length > 0) //throw new Error("number after number!");
									return undefined;
			numStr = s.shift()!;
		}
		else if ('wbgrky'.includes(s[0])) {			
			const color = letter2color(s.shift()!);			
			const num = numStr.length > 0 ? parseInt(numStr) : 1;
			res[color] += num;

			anyColor = true;

			numStr = '';
		}
		//else {
		//	return res;
		//}
	}
	
	if (!anyColor) //throw new Error('Empty color list');
				return undefined;
	
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


function verifyTake(v: ValVector): boolean {
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
