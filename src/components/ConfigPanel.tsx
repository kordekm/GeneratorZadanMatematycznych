import type { Config, ValidationError } from '../types';

interface ConfigPanelProps {
  config: Config;
  onChange: (config: Config) => void;
  errors: ValidationError[];
}

export function ConfigPanel({ config, onChange, errors }: ConfigPanelProps) {
  const getError = (field: string) => errors.find(e => e.field === field)?.message;
  
  const handleChange = <K extends keyof Config>(field: K, value: Config[K]) => {
    onChange({ ...config, [field]: value });
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-3">Konfiguracja</h2>
      
      <div className="space-y-3">
        <section>
          <h3 className="text-base font-semibold mb-2">Rodzaj działań</h3>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap w-32">
                Dodawanie:
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={config.operations.addition}
                onChange={(e) => handleChange('operations', {
                  ...config.operations,
                  addition: parseInt(e.target.value) || 0
                })}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <span className="text-xs text-gray-500">%</span>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap w-32">
                Odejmowanie:
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={config.operations.subtraction}
                onChange={(e) => handleChange('operations', {
                  ...config.operations,
                  subtraction: parseInt(e.target.value) || 0
                })}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <span className="text-xs text-gray-500">%</span>
            </div>
            
            {getError('operations') && (
              <p className="text-red-500 text-xs mt-1">{getError('operations')}</p>
            )}
            
            {config.operations.subtraction > 0 && (
              <div className="flex items-center mt-3 p-2 bg-blue-50 rounded">
                <input
                  type="checkbox"
                  id="allowNegativeResults"
                  checked={config.allowNegativeResults}
                  onChange={(e) => handleChange('allowNegativeResults', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="allowNegativeResults" className="text-sm font-medium">
                  Zezwól na wyniki ujemne
                </label>
              </div>
            )}
          </div>
        </section>
        
        <section>
          <h3 className="text-base font-semibold mb-2">Parametry zadań</h3>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap">
                Wartość minimalna:
              </label>
              <div className="flex-1">
                <input
                  type="number"
                  value={config.minValue}
                  onChange={(e) => handleChange('minValue', parseInt(e.target.value) || 0)}
                  className={`w-full px-2 py-1 border rounded text-sm ${getError('minValue') ? 'border-red-500' : 'border-gray-300'}`}
                />
                {getError('minValue') && (
                  <p className="text-red-500 text-xs mt-1">{getError('minValue')}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap">
                Wartość maksymalna:
              </label>
              <div className="flex-1">
                <input
                  type="number"
                  value={config.maxValue}
                  onChange={(e) => handleChange('maxValue', parseInt(e.target.value) || 0)}
                  className={`w-full px-2 py-1 border rounded text-sm ${getError('maxValue') ? 'border-red-500' : 'border-gray-300'}`}
                />
                {getError('maxValue') && (
                  <p className="text-red-500 text-xs mt-1">{getError('maxValue')}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap">
                Min. składników:
              </label>
              <div className="flex-1">
                <input
                  type="number"
                  min={2}
                  max={8}
                  value={config.minTerms}
                  onChange={(e) => handleChange('minTerms', parseInt(e.target.value) || 2)}
                  className={`w-full px-2 py-1 border rounded text-sm ${getError('minTerms') ? 'border-red-500' : 'border-gray-300'}`}
                />
                {getError('minTerms') && (
                  <p className="text-red-500 text-xs mt-1">{getError('minTerms')}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap">
                Max. składników:
              </label>
              <div className="flex-1">
                <input
                  type="number"
                  min={2}
                  max={8}
                  value={config.maxTerms}
                  onChange={(e) => handleChange('maxTerms', parseInt(e.target.value) || 2)}
                  className={`w-full px-2 py-1 border rounded text-sm ${getError('maxTerms') ? 'border-red-500' : 'border-gray-300'}`}
                />
                {getError('maxTerms') && (
                  <p className="text-red-500 text-xs mt-1">{getError('maxTerms')}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap">
                Liczba zadań:
              </label>
              <div className="flex-1">
                <input
                  type="number"
                  min={5}
                  max={200}
                  value={config.taskCount}
                  onChange={(e) => handleChange('taskCount', parseInt(e.target.value) || 5)}
                  className={`w-full px-2 py-1 border rounded text-sm ${getError('taskCount') ? 'border-red-500' : 'border-gray-300'}`}
                />
                {getError('taskCount') && (
                  <p className="text-red-500 text-xs mt-1">{getError('taskCount')}</p>
                )}
              </div>
            </div>
          </div>
        </section>
        
        <section>
          <h3 className="text-base font-semibold mb-2">Wygląd</h3>
          
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">
                Rozmiar czcionki (18-72 px)
              </label>
              <input
                type="range"
                min={18}
                max={72}
                value={config.fontSize}
                onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-center text-sm font-mono">{config.fontSize}px</div>
              {getError('fontSize') && (
                <p className="text-red-500 text-xs mt-1">{getError('fontSize')}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Kratka
              </label>
              <select
                value={config.gridMode}
                onChange={(e) => handleChange('gridMode', e.target.value as any)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="off">Wyłączona</option>
                <option value="light">Jasna</option>
                <option value="medium">Średnia</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Liczba kolumn
              </label>
              <select
                value={config.columns}
                onChange={(e) => handleChange('columns', parseInt(e.target.value) as any)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showTaskNumbers"
                checked={config.showTaskNumbers}
                onChange={(e) => handleChange('showTaskNumbers', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showTaskNumbers" className="text-sm font-medium">
                Numerowanie zadań
              </label>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
