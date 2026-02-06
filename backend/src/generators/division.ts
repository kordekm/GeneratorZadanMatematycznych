import { randomIntInclusive } from '../utils/math.js';

export function generateDivisionNumbers(
    rng: () => number,
    dividendDigits: number,
    divisorDigits: number,
    allowRemainder: boolean
): number[] {
    const minDivisor = Math.max(2, Math.pow(10, divisorDigits - 1));
    const maxDivisor = Math.pow(10, divisorDigits) - 1;

    if (!allowRemainder) {
        const divisor = randomIntInclusive(rng, minDivisor, maxDivisor);
        const minDividend = Math.pow(10, dividendDigits - 1);
        const maxDividend = Math.pow(10, dividendDigits) - 1;
        const minQuotient = Math.ceil(minDividend / divisor);
        const maxQuotient = Math.floor(maxDividend / divisor);

        if (minQuotient > maxQuotient) {
            return [];
        }

        const quotient = randomIntInclusive(rng, minQuotient, maxQuotient);
        const dividend = divisor * quotient;

        return [dividend, divisor];
    } else {
        const minDividend = Math.pow(10, dividendDigits - 1);
        const maxDividend = Math.pow(10, dividendDigits) - 1;
        const dividend = randomIntInclusive(rng, minDividend, maxDividend);
        const divisor = randomIntInclusive(rng, minDivisor, maxDivisor);

        return [dividend, divisor];
    }
}

export function generateDivisionTask(
    rng: () => number,
    dividendDigits: number,
    divisorDigits: number,
    allowRemainder: boolean
): { numbers: number[]; operations: ['÷']; found: boolean } {
    const numbers = generateDivisionNumbers(rng, dividendDigits, divisorDigits, allowRemainder);

    return {
        numbers,
        operations: ['÷'],
        found: numbers.length > 0
    };
}
