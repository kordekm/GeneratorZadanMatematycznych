export interface Task {
    id: number;
    numbers: number[];
    operations: ('+' | '-' | '*' | '÷')[];
    answer: number;
    remainder?: number;
}
export interface TaskRow {
    number: number;
    operation: string | null;
    isResult: boolean;
    isPartial: boolean;
    offset: number;
    hasLineBelow: boolean;
    isDivisionQuotient?: boolean;
    isDivisionDividend?: boolean;
    remainder?: number;
    divisor?: number;
}
//# sourceMappingURL=types.d.ts.map