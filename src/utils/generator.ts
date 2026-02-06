import seedrandom from 'seedrandom';
import { generateAdditionSubtractionTask } from '../generators/addition';
import { generateDivisionTask } from '../generators/division';
import { generateMultiplicationTask } from '../generators/multiplication';
import type { Config, Task } from '../types';
import { calculateAnswer, shuffleInPlace } from './math';

const MAX_ATTEMPTS = 1000;
const TIMEOUT_MS = 5000;

export class GeneratorError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'GeneratorError';
    }
}

export function generateTasks(config: Config): Task[] {
    const rng = seedrandom(config.seed);
    const tasks: Task[] = [];
    const startTime = Date.now();

    const plannedTasks: { type: 'addition' | 'subtraction' | 'multiplication' | 'division' }[] = [];

    if (config.addition.enabled) {
        for (let i = 0; i < config.addition.count; i++) plannedTasks.push({ type: 'addition' });
    }
    if (config.subtraction.enabled) {
        for (let i = 0; i < config.subtraction.count; i++) plannedTasks.push({ type: 'subtraction' });
    }
    if (config.multiplication.enabled) {
        for (let i = 0; i < config.multiplication.count; i++) plannedTasks.push({ type: 'multiplication' });
    }
    if (config.division.enabled) {
        for (let i = 0; i < config.division.count; i++) plannedTasks.push({ type: 'division' });
    }

    shuffleInPlace(rng, plannedTasks);

    let taskId = 1;
    for (const taskPlan of plannedTasks) {
        if (Date.now() - startTime > TIMEOUT_MS) break;

        let attempts = 0;
        let numbers: number[] = [];
        let operations: ('+' | '-' | '*' | '÷')[] = [];
        let found = false;

        const operationType = taskPlan.type;

        while (attempts < MAX_ATTEMPTS && !found) {
            if (operationType === 'division') {
                const result = generateDivisionTask(
                    rng,
                    config.division.dividendDigits,
                    config.division.divisorDigits,
                    config.division.allowRemainder
                );
                numbers = result.numbers;
                operations = result.operations;
                found = result.found;
            } else if (operationType === 'multiplication') {
                const result = generateMultiplicationTask(
                    rng,
                    config.multiplication.factor1Digits,
                    config.multiplication.factor2Digits,
                    config.carryMode
                );
                numbers = result.numbers;
                operations = result.operations;
                found = result.found;
            } else {
                const termCount = operationType === 'addition'
                    ? config.addition.minTerms + Math.floor(rng() * (config.addition.maxTerms - config.addition.minTerms + 1))
                    : 2;
                const minValue = operationType === 'addition' ? config.addition.minValue : config.subtraction.minValue;
                const maxValue = operationType === 'addition' ? config.addition.maxValue : config.subtraction.maxValue;
                const allowNegative = operationType === 'subtraction' ? config.subtraction.allowNegativeResults : false;

                const result = generateAdditionSubtractionTask(
                    rng,
                    operationType,
                    minValue,
                    maxValue,
                    termCount,
                    allowNegative,
                    config.carryMode,
                    attempts
                );
                numbers = result.numbers;
                operations = result.operations;

                if (result.found) {
                    const answer = calculateAnswer(numbers, operations);
                    const finalMeetsNegative = allowNegative || answer >= 0;
                    found = finalMeetsNegative;
                }
            }

            attempts++;
        }

        if (found) {
            const answer = calculateAnswer(numbers, operations);
            const task: Task = { id: taskId++, numbers, operations, answer };

            if (operationType === 'division' && numbers.length === 2) {
                const remainder = numbers[0] % numbers[1];
                if (remainder > 0) {
                    task.remainder = remainder;
                }
            }

            tasks.push(task);
        }
    }

    return tasks;
}

export function generateSeed(): string {
    return Math.floor(Math.random() * 1000000).toString();
}
