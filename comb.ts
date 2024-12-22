
import {ValVector, satisfies, vecAdd, vecSub, vecEnough, vecSum, str2vv, vv2str } from './valvec.ts';
import {Color, CardId, Game, setupStacks, getCardPrice, getCardPoints, getCardColor,
		} from './rules.ts';


// Sum 1
export const STR_1x1 = ["00001", "00010", "00100", "01000", "10000",];

// Sum 2
export const STR_2x1 = ["00011", "00110", "01100", "11000", "10001", "00101", "01010", "10100", "01001", "10010",];
export const STR_1x2 = ["00002", "00020", "00200", "02000", "20000",];

// Sum 3
export const STR_1x3 = ["00003", "00030", "00300", "03000", "30000",];
export const STR_1x2_1x1 = [
  "00012", "00120", "01200", "12000", "20001",
  "00102", "01020", "10200", "02001", "20010",
  "01002", "10020", "00201", "02010", "20100",
  "10002", "00021", "00210", "02100", "21000",
];		
export const STR_3x1 = ["00111", "01110", "11100", "11001", "10011", "01011", "10110", "01101", "11010", "10101",];


function vecEnoughFor2s(a: ValVector, b: ValVector): boolean {
	for (let i = 0; i < a.length; i++)
		if ((b[i] >= 2) && (a[i] < 4)) return false;
	return true;
}	


export function crossVecs(takes: string[], returns: string[]): ValVector[] {
	let sums: ValVector[] = [];
	let strSums: string[] = [];
	
	for (const t of takes) {
		for (const r of returns) {
			const added = vecSub(str2vv(t), str2vv(r));
			sums.push(added);
		}
	}
	
	return sums;
}


export function encodeVec(v: ValVector): number {
	let res = 0;
	
	for (let i = 5; i >= 0; i--) {
		res *= 16;
		res += (v[i] & 15);
	}
	
	return res;
}

export function decodeVec(n: number): ValVector {
	let res: ValVector = [0,0,0,0,0,0];

	for (let i = 0; i < 6; i++) {		
		res[i] = n & 15;
		if (res[i] > 7) res[i] -= 16; // 7 is max toks per color, above are negatives
		n = n >>> 4;
	}

	return res;
}

export function getReturns(surplus: number): string[] {
	if (surplus < 0 && surplus > 3) throw new Error("wrong surplus");
	
	let result: string[] = [];
	
	switch (surplus) {
	case 3:
		result = result.concat(STR_3x1);
		result = result.concat(STR_1x2_1x1);
		result = result.concat(STR_1x3);
		break;
	case 2:
		result = result.concat(STR_2x1);
		result = result.concat(STR_1x2);
		break;
	case 1:
		result = result.concat(STR_1x1);
		break;
	case 0:
		result.push("000000");
	}
	
	return result;
}


export function makeMoves(strs: string[], playerToks: ValVector, tableToks: ValVector, surplus: number): ValVector[] {	
	let legalTakes: string[] = [];
	let illegalTakes: string[] = [];
	
	// Moves are checked to not take more than table contains
	for (const s of strs) {
		const vec = str2vv(s);
		if (!vecEnough(tableToks, vec) || !vecEnoughFor2s(tableToks, vec)) illegalTakes.push(s);
		else legalTakes.push(s);
	}
	
    const rets = getReturns(surplus);
	
	// Moves which leave player with negative token are included, will be removed downstream
	return crossVecs(legalTakes, rets);
}

export function makeAllTakeMoves(playerToks: ValVector, tableToks:ValVector): ValVector[] {
	const nPlayerToks = vecSum(playerToks);
	const surplus1 = Math.max(0, nPlayerToks + 1 - 10);		  
	const surplus2 = Math.max(0, nPlayerToks + 2 - 10);		  
	const surplus3 = Math.max(0, nPlayerToks + 3 - 10);

	const moves3 = makeMoves(STR_3x1, playerToks, tableToks, surplus3);
	const moves2 = makeMoves(STR_2x1, playerToks, tableToks, surplus2);
	const moves2s = makeMoves(STR_1x2, playerToks, tableToks, surplus2);
	const moves1 = makeMoves(STR_1x1, playerToks, tableToks, surplus1);

	const allTakeMoves = moves3.concat(moves2).concat(moves2s).concat(moves1);
	
	return allTakeMoves;
}

export function uniqueMoves(moves: ValVector[]): ValVector[] {
	const encoded = moves.map(encodeVec);		
	const unique = new Set<number>(encoded);
	const decoded = [...unique].map(decodeVec);
	
	return decoded;	
}

export function str2nums(s: string, w: number, n: number): number[] {
	let res: number[] = [];
	
	for (let i = 1; i <= n; i++) {
		const sub = s.substr(-w*i, w);
		res.push(parseInt(sub, 16));
	}

	return res;
}

export function charPairs(s: string): string[] {
	let res: string[] = [];
	
	if (s.length % 2)
		s = '0' + s;
	
	for (let i = 0; i < s.length; i += 2)
		res.push(s.substr(i, 2));
	
	return res;
}

export function cutArray(arr: number[], lens: number[]): number[][] {
	let res: number[][] = [];
	
	let beg = 0;
	
	for (const n of lens) {
		res.push(arr.slice(beg, beg + n));
		beg += n;
	}
	
	return res;
}

