import seedrandom from 'seedrandom';
import type { CarryMode, Config, Task } from '../types';

const MAX_ATTEMPTS = 1000;
const FIX_ATTEMPT_THRESHOLD = 10; // Start fixing after this many failed random attempts

export class GeneratorError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'GeneratorError';
    }
}

function getDigits(num: number): number[] {
    return Math.abs(num).toString().split('').reverse().map(Number);
}

function setDigit(num: number, position: number, newDigit: number): number {
    const digits = getDigits(num);
    if (position >= digits.length) return num; // Should not happen for valid positions

    const power = Math.pow(10, position);
    const oldDigit = digits[position];
    const diff = newDigit - oldDigit;

    return num + (diff * power);
}

function hasCarryOrBorrow(numbers: number[], operations: ('+' | '-')[]): boolean {
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

// Tries to modify numbers in place to meet the carry requirement
function fixNumbersForCarry(
    rng: () => number,
    numbers: number[],
    operations: ('+' | '-')[],
    carryMode: CarryMode,
    minValue: number,
    maxValue: number
): boolean {
    if (carryMode === 'any') return true;

    // Deep copy numbers to modify locally first
    const newNumbers = [...numbers];
    const maxLength = Math.max(...newNumbers.map(n => Math.abs(n).toString().length));

    let changed = false;

    // Check if we need to fix
    const currentHasCarry = hasCarryOrBorrow(newNumbers, operations);

    if (carryMode === 'no-carry' && currentHasCarry) {
        // Fix: Eliminate carries/borrows
        for (let pos = 0; pos < maxLength; pos++) {
            let currentValue = 0;
            // Calculate column sum/diff
            for (let i = 0; i < newNumbers.length; i++) {
                const digit = Math.floor(Math.abs(newNumbers[i]) / Math.pow(10, pos)) % 10;
                if (i === 0) currentValue = digit;
                else if (operations[i - 1] === '+') currentValue += digit;
                else currentValue -= digit;
            }

            if (currentValue >= 10) {
                // Too high (carry), reduce one of the ADDED terms
                const candidateIndices = [0, ...operations.map((op, i) => op === '+' ? i + 1 : -1).filter(i => i !== -1)];
                const idx = candidateIndices[Math.floor(rng() * candidateIndices.length)];

                const currentDigit = Math.floor(Math.abs(newNumbers[idx]) / Math.pow(10, pos)) % 10;

                const reduction = currentValue - 9;
                let targetDigit = currentDigit - reduction;
                if (targetDigit < 0) targetDigit = 0;

                newNumbers[idx] = setDigit(newNumbers[idx], pos, targetDigit);
                changed = true;
            } else if (currentValue < 0) {
                // Too low (borrow)
                // Try increasing first number digit
                const currentDigit0 = Math.floor(Math.abs(newNumbers[0]) / Math.pow(10, pos)) % 10;
                const increase = Math.abs(currentValue);
                if (currentDigit0 + increase <= 9) {
                    newNumbers[0] = setDigit(newNumbers[0], pos, currentDigit0 + increase);
                    changed = true;
                } else {
                    // Could not fix easily by increasing top, try decreasing bottom
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
        // Fix: Create at least one carry/borrow
        const pos = Math.floor(rng() * (maxLength - 1)); // -1 to be safe

        const hasAddition = operations.includes('+');
        const hasSubtraction = operations.includes('-');

        if (hasAddition) {
            // Force addition carry
            const idx1 = 0;
            const addIndices = operations.map((op, i) => op === '+' ? i + 1 : -1).filter(i => i !== -1);
            if (addIndices.length > 0) {
                const idx2 = addIndices[Math.floor(rng() * addIndices.length)];

                const d1 = 5 + Math.floor(rng() * 5); // 5-9
                const d2 = 5 + Math.floor(rng() * 5); // 5-9

                newNumbers[idx1] = setDigit(newNumbers[idx1], pos, d1);
                newNumbers[idx2] = setDigit(newNumbers[idx2], pos, d2);
                changed = true;
            }
        } else if (hasSubtraction) {
            // Force borrow
            const d1 = Math.floor(rng() * 4); // 0-3
            const d2 = 5 + Math.floor(rng() * 5); // 5-9

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

function meetsCarryRequirement(numbers: number[], operations: ('+' | '-')[], carryMode: CarryMode): boolean {
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

function shuffleInPlace<T>(rng: () => number, arr: T[]): void {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

function generateOperations(
    termCount: number,
    operationType: 'addition' | 'subtraction'
): ('+' | '-')[] {
    const ops: ('+' | '-')[] = [];

    for (let i = 0; i < termCount - 1; i++) {
        if (operationType === 'addition') {
            ops.push('+');
        } else if (operationType === 'subtraction') {
            ops.push('-');
        }
    }

    return ops;
}

function calculateAnswer(numbers: number[], operations: ('+' | '-' | '*')[]): number {
    let result = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
        const op = operations[i - 1];
        if (op === '+') {
            result += numbers[i];
        } else if (op === '-') {
            result -= numbers[i];
        } else if (op === '*') {
            result *= numbers[i];
        }
    }
    return result;
}

function randomIntInclusive(rng: () => number, min: number, max: number): number {
    return min + Math.floor(rng() * (max - min + 1));
}

function generateNumbers(
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

function generateMultiplicationNumbers(
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

function hasMultiplicationCarry(n1: number, n2: number): boolean {
    const digits1 = getDigits(n1); // reversed [ones, tens...]
    const digits2 = getDigits(n2);

    // Store partial products aligned to correct power of 10
    const partials: number[] = [];

    for (let j = 0; j < digits2.length; j++) {
        let carry = 0;
        const d2 = digits2[j];

        for (let i = 0; i < digits1.length; i++) {
            const d1 = digits1[i];
            const product = d1 * d2 + carry;
            if (product >= 10) return true; // Carry in multiplication step
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

// Generate tasks based on new config structure
export function generateTasks(config: Config): Task[] {
    const rng = seedrandom(config.seed);
    const tasks: Task[] = [];
    const startTime = Date.now();
    const TIMEOUT_MS = 5000;

    // Build a flat list of operations to perform
    const plannedTasks: { type: 'addition' | 'subtraction' | 'multiplication' }[] = [];

    // Addition
    if (config.addition.enabled) {
        for (let i = 0; i < config.addition.count; i++) plannedTasks.push({ type: 'addition' });
    }
    // Subtraction
    if (config.subtraction.enabled) {
        for (let i = 0; i < config.subtraction.count; i++) plannedTasks.push({ type: 'subtraction' });
    }
    // Multiplication
    if (config.multiplication.enabled) {
        for (let i = 0; i < config.multiplication.count; i++) plannedTasks.push({ type: 'multiplication' });
    }

    // Shuffle tasks so they are mixed
    shuffleInPlace(rng, plannedTasks);

    let taskId = 1;
    for (const taskPlan of plannedTasks) {
        if (Date.now() - startTime > TIMEOUT_MS) break;

        let attempts = 0;
        let numbers: number[] = [];
        let operations: ('+' | '-' | '*')[] = [];
        let answer = 0;
        let found = false;

        const operationType = taskPlan.type;

        while (attempts < MAX_ATTEMPTS && !found) {

            if (operationType === 'multiplication') {
                operations = ['*'];
                numbers = generateMultiplicationNumbers(
                    rng,
                    config.multiplication.factor1Digits,
                    config.multiplication.factor2Digits
                );

                const n1 = numbers[0];
                const n2 = numbers[1];
                const hasCarry = hasMultiplicationCarry(n1, n2);

                let valid = true;
                if (config.carryMode === 'no-carry' && hasCarry) valid = false;
                if (config.carryMode === 'must-carry' && !hasCarry) valid = false;

                if (valid) found = true;

            } else {
                // Addition or Subtraction
                let termCount = 2;
                let currentMinValue = 0;
                let currentMaxValue = 100;
                let currentAllowNegative = false;

                if (operationType === 'addition') {
                    termCount = config.addition.minTerms + Math.floor(rng() * (config.addition.maxTerms - config.addition.minTerms + 1));
                    currentMinValue = config.addition.minValue;
                    currentMaxValue = config.addition.maxValue;
                } else {
                    // Subtraction
                    termCount = 2; // Usually subtraction is 2 terms for elementary, but could be more. Let's stick to 2 for now as per basic logic or use same term logic if expanded.
                    // The old logic allowed multi-term subtraction. The new config only has count/min/max. 
                    // Let's assume 2 terms for subtraction for now unless we add terms config to subtraction.
                    // Previously distinct config meant we could have multiple terms.
                    // "Odejmowanie miało opcję wyboru czy wyniki mogą być ujemne, wartości minilane i maksymalne wartości w działaniu"
                    // User didn't ask for number of terms for subtraction, so 2 is safe default.
                    currentMinValue = config.subtraction.minValue;
                    currentMaxValue = config.subtraction.maxValue;
                    currentAllowNegative = config.subtraction.allowNegativeResults;
                }

                operations = generateOperations(termCount, operationType);
                numbers = generateNumbers(rng, termCount, currentMinValue, currentMaxValue, operations as any, currentAllowNegative);

                if (numbers.length > 0) {
                    const meetsCarry = meetsCarryRequirement(numbers, operations as any, config.carryMode);

                    if (!meetsCarry && attempts > FIX_ATTEMPT_THRESHOLD) {
                        fixNumbersForCarry(rng, numbers, operations as any, config.carryMode, currentMinValue, currentMaxValue);
                    }

                    const finalMeetsCarry = meetsCarryRequirement(numbers, operations as any, config.carryMode);
                    answer = calculateAnswer(numbers, operations as any);
                    const finalMeetsNegative = currentAllowNegative || answer >= 0;

                    if (finalMeetsCarry && finalMeetsNegative) found = true;
                }
            }

            if (found) {
                answer = calculateAnswer(numbers, operations as any);
            }

            attempts++;
        }

        if (found) {
            tasks.push({ id: taskId++, numbers, operations, answer });
        }
    }

    return tasks;
}

export function generateSeed(): string {
    return Math.floor(Math.random() * 1000000).toString();
}
