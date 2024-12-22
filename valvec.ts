
export type ValVector = [number, number, number, number, number, number];


// Checks if price is exact 
export function satisfies(paid: ValVector, price: ValVector): boolean {
	let missing = 0;
	for (let i = 0; i < 5; i++)
		if (price[i] > paid[i]) missing += (price[i] - paid[i]);
	
	return paid[5] == missing;
}

export function vecAdd(a: ValVector, b: ValVector): ValVector {
	let res: ValVector = [0, 0, 0, 0, 0, 0];
	for (let i = 0; i < a.length; i++)
		res[i] = a[i] + b[i];
	return res;
}	

export function vecSub(a: ValVector, b: ValVector): ValVector {
	let res: ValVector = [0, 0, 0, 0, 0, 0];
	for (let i = 0; i < a.length; i++)
		res[i] = a[i] - b[i];
	return res;
}	

export function vecEnough(a: ValVector, b: ValVector): boolean {
	for (let i = 0; i < a.length; i++)
		if (!(a[i] >= b[i])) return false;
	return true;
}	

export function vecSum(a: ValVector): number {
	let res = 0;
	for (let i = 0; i < a.length; i++)
		res += a[i];
	return res;
}	



// BASE
export function vecNonNegative(v: ValVector): boolean {
	return !(v.some((x) => x < 0));
}

// BASE
export function vecLimit0(v: ValVector): ValVector {
	let res: ValVector = [...v];
	
	for (let i = 0; i < 6; i++) {
		if (res[i] < 0) res[i] = 0;
	}
	
	return res;
}

// BASE
export function str2vv(s: string): ValVector {
	let res: ValVector = [0, 0, 0, 0, 0, 0];
	const n = Math.min(s.length, 6);
	for (let i = 0; i < n; i++) {
		res[i] = parseInt(s[i]);
	}
	return res;
}

// BASE
export function vv2str(v: ValVector): string {
	return "[" + v + "]";
}



