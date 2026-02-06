import type { Config } from '../types';

const STORAGE_KEY = 'math-task-generator-config';

/**
 * Checks if localStorage is available
 * Returns false in private browsing mode or when localStorage is disabled
 */
function isLocalStorageAvailable(): boolean {
    try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Saves configuration to localStorage
 * @param config - Configuration object to save
 */
export function saveConfig(config: Config): void {
    if (!isLocalStorageAvailable()) {
        console.warn('localStorage is not available. Configuration will not be persisted.');
        return;
    }

    try {
        const serialized = JSON.stringify(config);
        localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
        if (error instanceof Error && error.name === 'QuotaExceededError') {
            console.error('localStorage quota exceeded. Cannot save configuration.');
        } else {
            console.error('Failed to save configuration to localStorage:', error);
        }
    }
}

/**
 * Loads configuration from localStorage
 * @returns Saved configuration or null if not found or on error
 */
export function loadConfig(): Config | null {
    if (!isLocalStorageAvailable()) {
        return null;
    }

    try {
        const serialized = localStorage.getItem(STORAGE_KEY);
        if (serialized === null) {
            return null;
        }

        const parsed = JSON.parse(serialized);
        return parsed as Config;
    } catch (error) {
        console.error('Failed to load configuration from localStorage:', error);
        // Clear corrupted data
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            // Ignore if we can't clear
        }
        return null;
    }
}

/**
 * Clears saved configuration from localStorage
 */
export function clearConfig(): void {
    if (!isLocalStorageAvailable()) {
        return;
    }

    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Failed to clear configuration from localStorage:', error);
    }
}
