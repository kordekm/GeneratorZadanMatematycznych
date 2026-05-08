export function getTaskRows(task) {
    const isMultiplication = task.operations.includes('*');
    const isDivision = task.operations.includes('÷');
    if (isDivision) {
        const dividend = task.numbers[0];
        const divisor = task.numbers[1];
        const quotient = task.answer;
        const remainder = task.remainder || 0;
        const dividendStr = dividend.toString();
        const steps = [];
        let currentDividend = 0;
        for (let i = 0; i < dividendStr.length; i++) {
            currentDividend = currentDividend * 10 + parseInt(dividendStr[i]);
            if (currentDividend >= divisor) {
                const digitQuotient = Math.floor(currentDividend / divisor);
                const product = digitQuotient * divisor;
                const stepRemainder = currentDividend - product;
                steps.push({ type: 'subtract', value: product, position: i });
                if (stepRemainder > 0 || i < dividendStr.length - 1) {
                    steps.push({ type: 'result', value: stepRemainder, position: i });
                }
                currentDividend = stepRemainder;
            }
        }
        const dividendLength = dividend.toString().length;
        const rows = [
            {
                number: quotient, operation: null, isResult: true, isPartial: false,
                offset: 0, hasLineBelow: true, isDivisionQuotient: true,
                remainder: remainder > 0 ? remainder : undefined
            },
            {
                number: dividend, operation: '÷', isResult: false, isPartial: false,
                offset: 0, hasLineBelow: false, isDivisionDividend: true, divisor
            }
        ];
        steps.forEach((step) => {
            const rightAlignPosition = step.position + 1;
            const offset = Math.max(0, dividendLength - rightAlignPosition);
            if (step.type === 'subtract') {
                rows.push({ number: step.value, operation: '-', isResult: false, isPartial: true, offset, hasLineBelow: true });
            }
            else {
                rows.push({ number: step.value, operation: null, isResult: false, isPartial: true, offset, hasLineBelow: false });
            }
        });
        return rows;
    }
    if (!isMultiplication) {
        return [
            ...task.numbers.map((num, idx) => ({
                number: num,
                operation: idx === 0 ? null : task.operations[idx - 1],
                isResult: false,
                isPartial: false,
                offset: 0,
                hasLineBelow: idx === task.numbers.length - 1
            })),
            { number: task.answer, operation: null, isResult: true, isPartial: false, offset: 0, hasLineBelow: false }
        ];
    }
    const n1 = task.numbers[0];
    const n2 = task.numbers[1];
    const n2Digits = Math.abs(n2).toString().split('').map(Number).reverse();
    const partials = n2Digits.map((d, i) => ({ val: n1 * d, offset: i }));
    const rows = [
        { number: n1, operation: null, isResult: false, isPartial: false, offset: 0, hasLineBelow: false },
        { number: n2, operation: '*', isResult: false, isPartial: false, offset: 0, hasLineBelow: true }
    ];
    if (partials.length > 1) {
        partials.forEach((p, idx) => {
            rows.push({
                number: p.val, operation: null, isResult: false, isPartial: true,
                offset: p.offset, hasLineBelow: idx === partials.length - 1
            });
        });
    }
    rows.push({ number: task.answer, operation: null, isResult: true, isPartial: false, offset: 0, hasLineBelow: false });
    return rows;
}
//# sourceMappingURL=taskRows.js.map