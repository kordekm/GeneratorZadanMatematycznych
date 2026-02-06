export function getDigits(num: number): number[] {
    return Math.abs(num).toString().split('').reverse().map(Number);
}

export function setDigit(num: number, position: number, newDigit: number): number {
    const digits = getDigits(num);
    if (position >= digits.length) return num;

    const power = Math.pow(10, position);
    const oldDigit = digits[position];
    const diff = newDigit - oldDigit;

    return num + (diff * power);
}

export function randomIntInclusive(rng: () => number, min: number, max: number): number {
    return min + Math.floor(rng() * (max - min + 1));
}

export function shuffleInPlace<T>(rng: () => number, arr: T[]): void {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

export function calculateAnswer(numbers: number[], operations: ('+' | '-' | '*' | '÷')[]): number {
    let result = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
        const op = operations[i - 1];
        if (op === '+') {
            result += numbers[i];
        } else if (op === '-') {
            result -= numbers[i];
        } else if (op === '*') {
            result *= numbers[i];
        } else if (op === '÷') {
            result = Math.floor(result / numbers[i]);
        }
    }
    return result;
}
