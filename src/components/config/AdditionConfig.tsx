import type { Config } from '../../types';

interface AdditionConfigProps {
  config: Config;
  onChange: (config: Config) => void;
}

export function AdditionConfig({ config, onChange }: AdditionConfigProps) {
  const handleChange = (field: keyof Config['addition'], value: any) => {
    onChange({
      ...config,
      addition: {
        ...config.addition,
        [field]: value
      }
    });
  };

  return (
    <div className={`border p-4 rounded-lg space-y-4 ${config.addition.enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <span>➕</span> Dodawanie w słupku
        </h3>
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                className="sr-only peer"
                checked={config.addition.enabled}
                onChange={(e) => handleChange('enabled', e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
        </label>
      </div>

      {config.addition.enabled && (
        <div className="space-y-4 animate-fadeIn">
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Liczba zadań
                </label>
                <input
                    type="number"
                    min={0}
                    max={100}
                    value={config.addition.count}
                    onChange={(e) => handleChange('count', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Wartość min</label>
                    <input
                        type="number"
                        min={0}
                        value={config.addition.minValue}
                        onChange={(e) => handleChange('minValue', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Wartość max</label>
                    <input
                        type="number"
                        min={config.addition.minValue}
                        value={config.addition.maxValue}
                        onChange={(e) => handleChange('maxValue', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    />
                </div>
            </div>

            <div className="space-y-2">
                 <label className="block text-sm font-medium text-gray-700">Liczba składników</label>
                 <div className="flex items-center gap-2">
                    <input
                        type="number"
                        min={2}
                        max={8}
                        value={config.addition.minTerms}
                        onChange={(e) => handleChange('minTerms', parseInt(e.target.value) || 2)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                        placeholder="Min"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                        type="number"
                        min={2}
                        max={8}
                        value={config.addition.maxTerms}
                        onChange={(e) => handleChange('maxTerms', parseInt(e.target.value) || 2)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                        placeholder="Max"
                    />
                 </div>
            </div>
        </div>
      )}
    </div>
  );
}
