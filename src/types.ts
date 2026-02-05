export type CarryMode = 'no-carry' | 'must-carry' | 'any';
export type GridMode = 'off' | 'light' | 'medium';
export type AnswerMode = 'none' | 'separate-page' | 'separate-pdf';
export type Orientation = 'portrait' | 'landscape';
export type OperationType = 'addition' | 'subtraction' | 'subtraction-only';

export interface OperationConfig {
    addition: number;
    subtraction: number;
}

export interface Config {
    minValue: number;
    maxValue: number;
    minTerms: number;
    maxTerms: number;
    taskCount: number;
    carryMode: CarryMode;
    fontSize: number;
    gridMode: GridMode;
    orientation: Orientation;
    columns: 1 | 2 | 3 | 4;
    showTaskNumbers: boolean;
    showAnswers: AnswerMode;
    showHeader: boolean;
    seed: string;
    operations: OperationConfig;
    allowNegativeResults: boolean;
}

export interface Task {
    id: number;
    numbers: number[];
    operations: ('+' | '-')[];
    answer: number;
}

export interface ValidationError {
    field: string;
    message: string;
}
