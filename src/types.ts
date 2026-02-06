export type CarryMode = 'no-carry' | 'must-carry' | 'any';
export type GridMode = 'off' | 'light' | 'medium';
export type AnswerMode = 'none' | 'separate-page' | 'separate-pdf';
export type Orientation = 'portrait' | 'landscape';
export type OperationType = 'addition' | 'subtraction' | 'subtraction-only';

export interface AdditionConfig {
    enabled: boolean;
    count: number;
    minTerms: number;
    maxTerms: number;
    minValue: number;
    maxValue: number;
}

export interface SubtractionConfig {
    enabled: boolean;
    count: number;
    minValue: number;
    maxValue: number;
    allowNegativeResults: boolean;
}

export interface MultiplicationConfig {
    enabled: boolean;
    count: number;
    factor1Digits: number;
    factor2Digits: number;
}

export interface DivisionConfig {
    enabled: boolean;
    count: number;
    dividendDigits: number;
    divisorDigits: number;
    allowRemainder: boolean;
}

export interface Config {
    // Visual settings
    fontSize: number;
    gridMode: GridMode;
    orientation: Orientation;
    columns: 1 | 2 | 3 | 4;
    showTaskNumbers: boolean;
    showAnswers: AnswerMode;
    showHeader: boolean;

    // Logic settings
    carryMode: CarryMode;
    seed: string;

    // Operations
    addition: AdditionConfig;
    subtraction: SubtractionConfig;
    multiplication: MultiplicationConfig;
    division: DivisionConfig;
}

export interface Task {
    id: number;
    numbers: number[];
    operations: ('+' | '-' | '*' | '÷')[];
    answer: number;
    remainder?: number;
}

export interface ValidationError {
    field: string;
    message: string;
}
