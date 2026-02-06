import type { Config } from '../../types';

interface SubtractionConfigProps {
  config: Config;
  onChange: (config: Config) => void;
}

export function SubtractionConfig({ config, onChange }: SubtractionConfigProps) {
  const handleChange = (field: keyof Config['subtraction'], value: any) => {
    onChange({
      ...config,
      subtraction: {
        ...config.subtraction,
        [field]: value
      }
    });
  };

  return (
    <div className={`border p-4 rounded-lg space-y-4 ${config.subtraction.enabled ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <span>➖</span> Odejmowanie w słupku
        </h3>
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                className="sr-only peer"
                checked={config.subtraction.enabled}
                onChange={(e) => handleChange('enabled', e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
        </label>
      </div>

      {config.subtraction.enabled && (
        <div className="space-y-4 animate-fadeIn">
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Liczba zadań
                </label>
                <input
                    type="number"
                    min={0}
                    max={100}
                    value={config.subtraction.count}
                    onChange={(e) => handleChange('count', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Wartość min</label>
                    <input
                        type="number"
                        min={0}
                        value={config.subtraction.minValue}
                        onChange={(e) => handleChange('minValue', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Wartość max</label>
                    <input
                        type="number"
                        min={config.subtraction.minValue}
                        value={config.subtraction.maxValue}
                        onChange={(e) => handleChange('maxValue', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                    />
                </div>
            </div>

            <div className="flex items-center p-2 bg-white rounded border border-red-100">
                <input
                  type="checkbox"
                  id="allowNegativeResults"
                  checked={config.subtraction.allowNegativeResults}
                  onChange={(e) => handleChange('allowNegativeResults', e.target.checked)}
                  className="mr-2 text-red-600 focus:ring-red-500 rounded border-gray-300"
                />
                <label htmlFor="allowNegativeResults" className="text-sm font-medium text-gray-700">
                  Zezwól na wyniki ujemne
                </label>
            </div>
        </div>
      )}
    </div>
  );
}
