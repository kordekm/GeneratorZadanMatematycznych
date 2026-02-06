import type { Config, Task } from '../types';

const API_BASE = '/api';

export async function generateTasks(config: Config): Promise<Task[]> {
    const response = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Błąd serwera' }));
        throw new Error(error.error || 'Błąd generowania zadań');
    }

    const data = await response.json();
    return data.tasks;
}

export async function saveConfigToServer(config: Config): Promise<void> {
    const response = await fetch(`${API_BASE}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Błąd serwera' }));
        throw new Error(error.error || 'Błąd zapisu konfiguracji');
    }
}

export async function loadConfigFromServer(): Promise<Config | null> {
    try {
        const response = await fetch(`${API_BASE}/config`);
        if (response.status === 404) return null;
        if (!response.ok) throw new Error('Błąd odczytu konfiguracji');
        return await response.json();
    } catch {
        return null;
    }
}
