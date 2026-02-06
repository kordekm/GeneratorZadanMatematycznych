import { useCallback, useRef, useState } from 'react';
import type { Config, Task } from '../types';
import { generateTasks } from '../services/api';

interface UseApiResult {
    tasks: Task[];
    isGenerating: boolean;
    error: string | null;
    generate: (config: Config) => void;
}

export function useApi(): UseApiResult {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const generate = useCallback((config: Config) => {
        // Cancel previous request if still in progress
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        setIsGenerating(true);
        setError(null);

        const controller = new AbortController();
        abortControllerRef.current = controller;

        generateTasks(config)
            .then((generatedTasks) => {
                if (!controller.signal.aborted) {
                    setTasks(generatedTasks);
                    setError(null);
                    setIsGenerating(false);
                }
            })
            .catch((err) => {
                if (!controller.signal.aborted) {
                    if (err instanceof Error && err.name !== 'AbortError') {
                        setError(err.message);
                        setTasks([]);
                    }
                    setIsGenerating(false);
                }
            });
    }, []);

    return { tasks, isGenerating, error, generate };
}
