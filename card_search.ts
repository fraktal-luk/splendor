
import {
	getCardPrice, TokenState, statesUnique, PlayerCardState, CardState, enoughStates,
} from './lib/searching_base.ts';

import {GameStates} from './lib/GameStates.ts'



let waveC = new GameStates.WavefrontC();


for (let i = 0; i < 11; i++)
	waveC.runStep();
