import seedrandom from 'seedrandom';
import type { CarryMode, OperationConfig, Task } from '../types';

const MAX_ATTEMPTS = 1000;

export class GeneratorError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'GeneratorError';
    }
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

function buildOperationPlan(
    rng: () => number,
    count: number,
    operationConfig: OperationConfig
): ('addition' | 'subtraction')[] {
    const total = operationConfig.addition + operationConfig.subtraction;
    if (total === 0) {
        return Array.from({ length: count }, () => 'addition');
    }

    const subtractionTarget = Math.round((count * operationConfig.subtraction) / total);
    const additionTarget = count - subtractionTarget;

    const plan: ('addition' | 'subtraction')[] = [
        ...Array.from({ length: additionTarget }, () => 'addition' as const),
        ...Array.from({ length: subtractionTarget }, () => 'subtraction' as const),
    ];

    shuffleInPlace(rng, plan);
    return plan;
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

function calculateAnswer(numbers: number[], operations: ('+' | '-')[]): number {
    let result = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
        if (operations[i - 1] === '+') {
            result += numbers[i];
        } else {
            result -= numbers[i];
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

export function generateTasks(
    count: number,
    minValue: number,
    maxValue: number,
    minTerms: number,
    maxTerms: number,
    carryMode: CarryMode,
    seed: string,
    operationConfig: OperationConfig,
    allowNegativeResults: boolean
): Task[] {
    const rng = seedrandom(seed);
    const tasks: Task[] = [];
    const startTime = Date.now();
    const TIMEOUT_MS = 5000;

    const operationPlan = buildOperationPlan(rng, count, operationConfig);

    for (let taskId = 1; taskId <= count; taskId++) {
        if (Date.now() - startTime > TIMEOUT_MS) {
            throw new GeneratorError(
                `Generowanie trwa zbyt długo (przekroczono 5 sekund). ` +
                `Wygenerowano ${tasks.length} z ${count} zadań. ` +
                `Spróbuj zmienić parametry: zwiększ zakres liczb, zmień tryb przeniesień lub zmniejsz liczbę zadań.`
            );
        }

        let attempts = 0;
        let numbers: number[] = [];
        let operations: ('+' | '-')[] = [];
        let answer = 0;
        let found = false;

        const operationType = operationPlan[taskId - 1];

        while (attempts < MAX_ATTEMPTS && !found) {
            const termCount = minTerms + Math.floor(rng() * (maxTerms - minTerms + 1));

            operations = generateOperations(termCount, operationType);
            numbers = generateNumbers(rng, termCount, minValue, maxValue, operations, allowNegativeResults);

            if (numbers.length === 0) {
                attempts++;
                continue;
            }

            answer = calculateAnswer(numbers, operations);

            const meetsCarry = meetsCarryRequirement(numbers, operations, carryMode);
            const meetsNegativeRequirement = allowNegativeResults || answer >= 0;

            if (meetsCarry && meetsNegativeRequirement) {
                found = true;
            }

            attempts++;
        }

        if (!found) {
            throw new GeneratorError(
                `Nie można wygenerować zadania ${taskId} spełniającego wymagania po ${MAX_ATTEMPTS} próbach. ` +
                `Spróbuj zmienić parametry (zakres liczb, tryb przeniesień, liczbę składników lub opcje wyników ujemnych).`
            );
        }

        tasks.push({ id: taskId, numbers, operations, answer });
    }

    return tasks;
}

export function generateSeed(): string {
    return Math.floor(Math.random() * 1000000).toString();
}
