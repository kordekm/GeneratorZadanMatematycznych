import type { CarryMode } from '../types';
import { setDigit } from './math';

export function hasCarryOrBorrow(numbers: number[], operations: ('+' | '-')[]): boolean {
    const maxLength = Math.max(...numbers.map(n => Math.abs(n).toString().length));
    let hasAny = false;

    for (let position = 0; position < maxLength; position++) {
        let currentValue = 0;

        for (let i = 0; i < numbers.length; i++) {
            const digit = Math.floor(Math.abs(numbers[i]) / Math.pow(10, position)) % 10;
            if (i === 0) {
                currentValue = digit;
            } else {
                if (operations[i - 1] === '+') {
                    currentValue += digit;
                } else {
                    currentValue -= digit;
                }
            }
        }

        if (currentValue >= 10 || currentValue < 0) {
            hasAny = true;
        }
    }

    return hasAny;
}

export function meetsCarryRequirement(numbers: number[], operations: ('+' | '-')[], carryMode: CarryMode): boolean {
    if (carryMode === 'any') return true;

    const hasCarryValue = hasCarryOrBorrow(numbers, operations);

    switch (carryMode) {
        case 'no-carry':
            return !hasCarryValue;
        case 'must-carry':
            return hasCarryValue;
        default:
            return true;
    }
}

export function fixNumbersForCarry(
    rng: () => number,
    numbers: number[],
    operations: ('+' | '-')[],
    carryMode: CarryMode,
    minValue: number,
    maxValue: number
): boolean {
    if (carryMode === 'any') return true;

    const newNumbers = [...numbers];
    const maxLength = Math.max(...newNumbers.map(n => Math.abs(n).toString().length));
    let changed = false;

    const currentHasCarry = hasCarryOrBorrow(newNumbers, operations);

    if (carryMode === 'no-carry' && currentHasCarry) {
        for (let pos = 0; pos < maxLength; pos++) {
            let currentValue = 0;
            for (let i = 0; i < newNumbers.length; i++) {
                const digit = Math.floor(Math.abs(newNumbers[i]) / Math.pow(10, pos)) % 10;
                if (i === 0) currentValue = digit;
                else if (operations[i - 1] === '+') currentValue += digit;
                else currentValue -= digit;
            }

            if (currentValue >= 10) {
                const candidateIndices = [0, ...operations.map((op, i) => op === '+' ? i + 1 : -1).filter(i => i !== -1)];
                const idx = candidateIndices[Math.floor(rng() * candidateIndices.length)];
                const currentDigit = Math.floor(Math.abs(newNumbers[idx]) / Math.pow(10, pos)) % 10;
                const reduction = currentValue - 9;
                let targetDigit = currentDigit - reduction;
                if (targetDigit < 0) targetDigit = 0;
                newNumbers[idx] = setDigit(newNumbers[idx], pos, targetDigit);
                changed = true;
            } else if (currentValue < 0) {
                const currentDigit0 = Math.floor(Math.abs(newNumbers[0]) / Math.pow(10, pos)) % 10;
                const increase = Math.abs(currentValue);
                if (currentDigit0 + increase <= 9) {
                    newNumbers[0] = setDigit(newNumbers[0], pos, currentDigit0 + increase);
                    changed = true;
                } else {
                    const subIndices = operations.map((op, i) => op === '-' ? i + 1 : -1).filter(i => i !== -1);
                    if (subIndices.length > 0) {
                        const idx = subIndices[Math.floor(rng() * subIndices.length)];
                        const currentDigit = Math.floor(Math.abs(newNumbers[idx]) / Math.pow(10, pos)) % 10;
                        if (currentDigit - increase >= 0) {
                            newNumbers[idx] = setDigit(newNumbers[idx], pos, currentDigit - increase);
                            changed = true;
                        }
                    }
                }
            }
        }
    } else if (carryMode === 'must-carry' && !currentHasCarry) {
        const pos = Math.floor(rng() * (maxLength - 1));
        const hasAddition = operations.includes('+');
        const hasSubtraction = operations.includes('-');

        if (hasAddition) {
            const idx1 = 0;
            const addIndices = operations.map((op, i) => op === '+' ? i + 1 : -1).filter(i => i !== -1);
            if (addIndices.length > 0) {
                const idx2 = addIndices[Math.floor(rng() * addIndices.length)];
                const d1 = 5 + Math.floor(rng() * 5);
                const d2 = 5 + Math.floor(rng() * 5);
                newNumbers[idx1] = setDigit(newNumbers[idx1], pos, d1);
                newNumbers[idx2] = setDigit(newNumbers[idx2], pos, d2);
                changed = true;
            }
        } else if (hasSubtraction) {
            const d1 = Math.floor(rng() * 4);
            const d2 = 5 + Math.floor(rng() * 5);
            newNumbers[0] = setDigit(newNumbers[0], pos, d1);
            const subIndices = operations.map((op, i) => op === '-' ? i + 1 : -1).filter(i => i !== -1);
            if (subIndices.length > 0) {
                const idx2 = subIndices[Math.floor(rng() * subIndices.length)];
                newNumbers[idx2] = setDigit(newNumbers[idx2], pos, d2);
                changed = true;
            }
        }
    } else {
        return false;
    }

    if (changed) {
        const allInRange = newNumbers.every(n => n >= minValue && n <= maxValue);
        if (allInRange) {
            for (let i = 0; i < numbers.length; i++) numbers[i] = newNumbers[i];
            return true;
        }
    }

    return false;
}
