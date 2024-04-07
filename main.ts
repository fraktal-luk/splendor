
import {Game} from './rules.ts';


let game = new Game(2);

console.log(game.table.str());
console.log(game.players[0]);


function handleInput(input: any): void {
	if (input.toString()[0] == 'q') process.exit(0);
	else {
		//console.log(input.toString() + '{}');
		if (game.movePlayer(0, input.toString())) {
		
			console.log(game.table.strSh());
			//console.log(game.table.tnStr());
			console.log('');
			console.log(game.players[0].strSh(0));
			
			
			game.sumUp();
		}
		else {
			console.log('Move not valid');
		}
		
	}
}

process.stdin.on('data', handleInput
);
