import { useCallback, useEffect, useRef, useState } from 'react';
import type { Config, Task } from '../types';

interface UseTaskGeneratorResult {
    tasks: Task[];
    isGenerating: boolean;
    error: string | null;
    generate: (config: Config) => void;
}

export function useTaskGenerator(): UseTaskGeneratorResult {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        // Initialize worker
        workerRef.current = new Worker(new URL('../workers/taskGenerator.ts', import.meta.url), {
            type: 'module'
        });

        workerRef.current.onmessage = (e) => {
            const { type, tasks: generatedTasks, message } = e.data;

            if (type === 'SUCCESS') {
                setTasks(generatedTasks);
                setError(null);
            } else if (type === 'ERROR') {
                setError(message);
                setTasks([]);
            }

            setIsGenerating(false);
        };

        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    const generate = useCallback((config: Config) => {
        if (!workerRef.current) return;

        setIsGenerating(true);
        setError(null);

        // Prepare message data
        const message = {
            config
        };

        workerRef.current.postMessage(message);
    }, []);

    return { tasks, isGenerating, error, generate };
}
