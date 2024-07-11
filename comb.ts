
import {Color, ValVector, CardId, Game, setupStacks, getCardPrice, getCardPoints, getCardColor,
		vecAdd, vecSub, vecEnough, vecSum} from './rules.ts';


function generateReturns0(): ValVector[] {
	let res: ValVector[] = [];
	const v: ValVector = [0, 0, 0, 0, 0, 0]; 
	
	res.push(v);

	return res;
}

export function generateReturns(takes: ValVector, surplus: number): ValVector[] {
	let res: ValVector[] = [];
	
	const nFree = vecSum(takes);
	
	if (surplus == 0) return generateReturns0();
	
	


	return res;
}


// Deal up to 3 in all ways among 2 slots with '0' in the input
function generateReturns3(ones: ValVector, surplus: number): ValVector[] {
	let res: ValVector[] = [];

	// Leave out the last element cause yellow not used
	const firstInd = ones.slice(0,5).indexOf(0);
	const secondInd = ones.slice(0,5).lastIndexOf(0);

	for (let firstReturn = 0; firstReturn <= surplus; firstReturn++) {
	  const secondReturn = surplus - firstReturn;
	  
	  let current: ValVector = [0, 0, 0, 0, 0, 0];
	  current[firstInd] = firstReturn;
	  current[secondInd] = secondReturn;
	  res.push(current);
	}

	return res;
}
