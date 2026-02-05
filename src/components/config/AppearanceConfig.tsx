import type { Config, ValidationError } from '../../types';

interface AppearanceConfigProps {
  config: Config;
  onChange: (config: Config) => void;
  errors: ValidationError[];
}

export function AppearanceConfig({ config, onChange, errors }: AppearanceConfigProps) {
  const getError = (field: string) => errors.find(e => e.field === field)?.message;

  const handleChange = <K extends keyof Config>(field: K, value: Config[K]) => {
    onChange({ ...config, [field]: value });
  };

  return (
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
  );
}
