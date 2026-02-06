import type { Config } from '../types';

export function exportConfigToJson(config: Config): void {
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const filename = `config-${dateStr}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function importConfigFromJson(file: File): Promise<Config> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const config = JSON.parse(text) as Config;

                // Basic validation
                if (!config.seed || !config.addition || !config.subtraction) {
                    reject(new Error('Nieprawidłowy format pliku konfiguracji'));
                    return;
                }

                resolve(config);
            } catch {
                reject(new Error('Nie można odczytać pliku JSON'));
            }
        };
        reader.onerror = () => reject(new Error('Błąd odczytu pliku'));
        reader.readAsText(file);
    });
}
