import type { Config } from '../types';
import { generateTasks, GeneratorError } from '../utils/generator';

// Pass the full config object to ensure we have all settings including multiplication
export interface GeneratorMessage {
    config: Config;
}

self.onmessage = (e: MessageEvent<GeneratorMessage>) => {
    try {
        const { config } = e.data;

        // generateTasks now expects the full config object.
        const tasks = generateTasks(config);

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
