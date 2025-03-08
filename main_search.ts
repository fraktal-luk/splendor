
import {TokenState, statesUnique, getCardPrice,
		CardState,  StateGroup,  Wave
} from './lib/searching.ts';



let stateGroup0 = new StateGroup();
let stateGroup0N = stateGroup0.copy();
stateGroup0N.tokState[0] = new TokenState("320110", "12433");
stateGroup0N.tokState[0] = new TokenState("222220", "22222");


const wave0 = Wave.fromSG(stateGroup0);


const wave1 = wave0.next_Repeating();
const wave2 = wave1.next_Repeating();
const wave3 = wave2.next_Repeating();

console.time('1');
const wave4 = wave3.next_Repeating();
const wave5 = wave4.next_Repeating();
const wave6 = wave5.next_Repeating();
//const wave7 = wave6.next_Repeating();

console.timeEnd('1');
console.log('');


console.time('2');

const wave4u = wave3.next();
const wave5u = wave4u.next();
const wave6u = wave5u.next();
//const wave7u = wave6u.next();

console.timeEnd('2');
console.log('');


 console.log(`${wave6.groupSize()}, ${wave6.stateSize()}`);
 console.log(`${wave6u.groupSize()}, ${wave6u.stateSize()}`);
