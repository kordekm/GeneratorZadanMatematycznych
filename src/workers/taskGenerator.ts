import type { CarryMode, OperationConfig } from '../types';
import { generateTasks, GeneratorError } from '../utils/generator';

export interface GeneratorMessage {
    count: number;
    minValue: number;
    maxValue: number;
    minTerms: number;
    maxTerms: number;
    carryMode: CarryMode;
    seed: string;
    operationConfig: OperationConfig;
    allowNegativeResults: boolean;
}

self.onmessage = (e: MessageEvent<GeneratorMessage>) => {
    try {
        const {
            count,
            minValue,
            maxValue,
            minTerms,
            maxTerms,
            carryMode,
            seed,
            operationConfig,
            allowNegativeResults
        } = e.data;

        const tasks = generateTasks(
            count,
            minValue,
            maxValue,
            minTerms,
            maxTerms,
            carryMode,
            seed,
            operationConfig,
            allowNegativeResults
        );

        self.postMessage({ type: 'SUCCESS', tasks });
    } catch (error) {
        if (error instanceof GeneratorError) {
            self.postMessage({ type: 'ERROR', message: error.message });
        } else {
            console.error('Worker error:', error);
            self.postMessage({ type: 'ERROR', message: 'Wystąpił nieoczekiwany błąd podczas generowania' });
        }
    }
};
