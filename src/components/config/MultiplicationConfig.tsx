
import type { Config, ValidationError } from '../../types';

interface MultiplicationConfigProps {
    config: Config;
    onChange: (config: Config) => void;
    errors: ValidationError[];
}

export function MultiplicationConfigPanel({ config, onChange, errors }: MultiplicationConfigProps) {

    const handleChange = (field: keyof Config['multiplication'], value: any) => {
        onChange({
            ...config,
            multiplication: {
                ...config.multiplication,
                [field]: value,
            },
        });
    };



    return (
        <div className={`border p-4 rounded-lg space-y-4 ${config.multiplication.enabled ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <span>✖️</span> Mnożenie w słupku
                </h3>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={config.multiplication.enabled}
                        onChange={(e) => handleChange('enabled', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>

            {config.multiplication.enabled && (
                <div className="space-y-4 animate-fadeIn">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Liczba zadań
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={config.multiplication.count}
                            onChange={(e) => handleChange('count', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cyfry czynnika 1
                            </label>
                            <select
                                value={config.multiplication.factor1Digits}
                                onChange={(e) => handleChange('factor1Digits', parseInt(e.target.value))}
                                className="w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value={1}>1 cyfra (0-9)</option>
                                <option value={2}>2 cyfry (10-99)</option>
                                <option value={3}>3 cyfry (100-999)</option>
                                <option value={4}>4 cyfry (1000-9999)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cyfry czynnika 2
                            </label>
                            <select
                                value={config.multiplication.factor2Digits}
                                onChange={(e) => handleChange('factor2Digits', parseInt(e.target.value))}
                                className="w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value={1}>1 cyfra (0-9)</option>
                                <option value={2}>2 cyfry (10-99)</option>
                                <option value={3}>3 cyfry (100-999)</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded border border-blue-100 text-sm text-blue-800">
                        <p>
                            <strong>Info:</strong> Dla zadań z mnożenia ignorowane są globalne ustawienia zakresu liczb (min/max).
                            Generowane są liczby o wybranej liczbie cyfr.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
