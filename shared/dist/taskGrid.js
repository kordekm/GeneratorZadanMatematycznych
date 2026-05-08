export function getTaskGridWidth(task) {
    const isMultiplication = task.operations.includes('*');
    if (!isMultiplication) {
        return Math.max(...task.numbers.map(n => Math.abs(n).toString().length), task.answer.toString().length);
    }
    const n1 = task.numbers[0];
    const n2 = task.numbers[1];
    const n2Digits = Math.abs(n2).toString().split('').map(Number).reverse();
    let maxWidth = Math.max(Math.abs(n1).toString().length, Math.abs(n2).toString().length, task.answer.toString().length);
    n2Digits.forEach((d, i) => {
        const partialVal = n1 * d;
        const partialWidth = Math.abs(partialVal).toString().length + i;
        maxWidth = Math.max(maxWidth, partialWidth);
    });
    return maxWidth;
}
export function getMaxGridWidth(tasks) {
    if (tasks.length === 0)
        return 1;
    return Math.max(...tasks.map(t => getTaskGridWidth(t)));
}
//# sourceMappingURL=taskGrid.js.map