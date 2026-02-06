import type { CarryMode } from '../types.js';
import { randomIntInclusive, getDigits } from '../utils/math.js';
import { hasCarryOrBorrow } from '../utils/carry.js';

export function generateMultiplicationNumbers(
    rng: () => number,
    factor1Digits: number,
    factor2Digits: number
): number[] {
    const min1 = Math.pow(10, factor1Digits - 1);
    const max1 = Math.pow(10, factor1Digits) - 1;
    const min2 = Math.pow(10, factor2Digits - 1);
    const max2 = Math.pow(10, factor2Digits) - 1;

    return [
        randomIntInclusive(rng, min1, max1),
        randomIntInclusive(rng, min2, max2)
    ];
}

export function hasMultiplicationCarry(n1: number, n2: number): boolean {
    const digits1 = getDigits(n1);
    const digits2 = getDigits(n2);
    const partials: number[] = [];

    for (let j = 0; j < digits2.length; j++) {
        let carry = 0;
        const d2 = digits2[j];

        for (let i = 0; i < digits1.length; i++) {
            const d1 = digits1[i];
            const product = d1 * d2 + carry;
            if (product >= 10) return true;
            carry = Math.floor(product / 10);
        }
        if (carry > 0) return true;

        partials.push(n1 * d2 * Math.pow(10, j));
    }

    if (partials.length > 1) {
        if (hasCarryOrBorrow(partials, Array(partials.length - 1).fill('+'))) return true;
    }

    return false;
}

export function generateMultiplicationTask(
    rng: () => number,
    factor1Digits: number,
    factor2Digits: number,
    carryMode: CarryMode
): { numbers: number[]; operations: ['*']; found: boolean } {
    const numbers = generateMultiplicationNumbers(rng, factor1Digits, factor2Digits);
    const n1 = numbers[0];
    const n2 = numbers[1];
    const hasCarry = hasMultiplicationCarry(n1, n2);

    let valid = true;
    if (carryMode === 'no-carry' && hasCarry) valid = false;
    if (carryMode === 'must-carry' && !hasCarry) valid = false;

    return { 
        numbers, 
        operations: ['*'], 
        found: valid 
    };
}
