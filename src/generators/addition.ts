import type { CarryMode } from '../types';
import { randomIntInclusive } from '../utils/math';
import { meetsCarryRequirement, fixNumbersForCarry } from '../utils/carry';

const FIX_ATTEMPT_THRESHOLD = 10;

export function generateOperations(
    termCount: number,
    operationType: 'addition' | 'subtraction'
): ('+' | '-')[] {
    const ops: ('+' | '-')[] = [];
    for (let i = 0; i < termCount - 1; i++) {
        ops.push(operationType === 'addition' ? '+' : '-');
    }
    return ops;
}

export function generateNumbers(
    rng: () => number,
    termCount: number,
    minValue: number,
    maxValue: number,
    operations: ('+' | '-')[],
    allowNegativeResults: boolean
): number[] {
    if (operations.every(op => op === '-') && !allowNegativeResults) {
        const tail: number[] = [];
        let sumTail = 0;

        for (let i = 1; i < termCount; i++) {
            const num = randomIntInclusive(rng, minValue, maxValue);
            tail.push(num);
            sumTail += num;
        }

        if (sumTail > maxValue) {
            return [];
        }

        const head = randomIntInclusive(rng, Math.max(minValue, sumTail), maxValue);
        return [head, ...tail];
    }

    const numbers: number[] = [];
    for (let i = 0; i < termCount; i++) {
        numbers.push(randomIntInclusive(rng, minValue, maxValue));
    }
    return numbers;
}

export function generateAdditionSubtractionTask(
    rng: () => number,
    operationType: 'addition' | 'subtraction',
    minValue: number,
    maxValue: number,
    termCount: number,
    allowNegativeResults: boolean,
    carryMode: CarryMode,
    attempts: number
): { numbers: number[]; operations: ('+' | '-')[]; found: boolean } {
    const operations = generateOperations(termCount, operationType);
    const numbers = generateNumbers(rng, termCount, minValue, maxValue, operations, allowNegativeResults);

    if (numbers.length === 0) {
        return { numbers: [], operations, found: false };
    }

    const meetsCarry = meetsCarryRequirement(numbers, operations, carryMode);

    if (!meetsCarry && attempts > FIX_ATTEMPT_THRESHOLD) {
        fixNumbersForCarry(rng, numbers, operations, carryMode, minValue, maxValue);
    }

    const finalMeetsCarry = meetsCarryRequirement(numbers, operations, carryMode);
    
    return { 
        numbers, 
        operations, 
        found: finalMeetsCarry 
    };
}
