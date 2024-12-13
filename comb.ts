
import { ValVector, satisfies, vecAdd, vecSub, vecEnough, vecSum, str2vv, vv2str } from './valvec.ts';
import {Color, CardId, Game, setupStacks, getCardPrice, getCardPoints, getCardColor,
		} from './rules.ts';



// COMB:

// Sum 1
export const STR_1x1 = [
  "00001", "00010", "00100", "01000", "10000",
];

// Sum 2
export const STR_2x1 = [
  "00011", "00110", "01100", "11000", "10001", "00101", "01010", "10100", "01001", "10010",
];

export const STR_1x2 = [
  "00002", "00020", "00200", "02000", "20000",
];


// Sum 3
export const STR_1x3 = [
  "00003", "00030", "00300", "03000", "30000",
];

export const STR_1x2_1x1 = [
  "00012", "00120", "01200", "12000", "20001",
  "00102", "01020", "10200", "02001", "20010",
  "01002", "10020", "00201", "02010", "20100",
  "10002", "00021", "00210", "02100", "21000",
];		

export const STR_3x1 = [
  "00111", "01110", "11100", "11001", "10011", "01011", "10110", "01101", "11010", "10101",
];


// COMB
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
