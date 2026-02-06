import type { Config } from '../../types';

interface DivisionConfigProps {
    config: Config;
    onChange: (config: Config) => void;
}

export function DivisionConfig({ config, onChange }: DivisionConfigProps) {
    const handleChange = (field: keyof Config['division'], value: any) => {
        onChange({
            ...config,
            division: {
                ...config.division,
                [field]: value,
            },
        });
    };

    return (
        <div className={`border p-4 rounded-lg space-y-4 ${config.division.enabled ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <span>➗</span> Dzielenie w słupku
                </h3>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={config.division.enabled}
                        onChange={(e) => handleChange('enabled', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
            </div>

            {config.division.enabled && (
                <div className="space-y-4 animate-fadeIn">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Liczba zadań
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={config.division.count}
                            onChange={(e) => handleChange('count', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cyfry dzielnej
                            </label>
                            <select
                                value={config.division.dividendDigits}
                                onChange={(e) => handleChange('dividendDigits', parseInt(e.target.value))}
                                className="w-full p-2 border rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                            >
                                <option value={2}>2 cyfry (10-99)</option>
                                <option value={3}>3 cyfry (100-999)</option>
                                <option value={4}>4 cyfry (1000-9999)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cyfry dzielnika
                            </label>
                            <select
                                value={config.division.divisorDigits}
                                onChange={(e) => handleChange('divisorDigits', parseInt(e.target.value))}
                                className="w-full p-2 border rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                            >
                                <option value={1}>1 cyfra (1-9)</option>
                                <option value={2}>2 cyfry (10-99)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center p-2 bg-white rounded border border-orange-100">
                        <input
                            type="checkbox"
                            id="allowRemainder"
                            checked={config.division.allowRemainder}
                            onChange={(e) => handleChange('allowRemainder', e.target.checked)}
                            className="mr-2 text-orange-600 focus:ring-orange-500 rounded border-gray-300"
                        />
                        <label htmlFor="allowRemainder" className="text-sm font-medium text-gray-700">
                            Zezwól na resztę z dzielenia
                        </label>
                    </div>

                    <div className="bg-white p-3 rounded border border-orange-100 text-sm text-orange-800">
                        <p>
                            <strong>Info:</strong> Dzielenie nie uwzględnia globalnego trybu przeniesień.
                            Opcja "Zezwól na resztę" kontroluje czy wynik może mieć resztę.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
