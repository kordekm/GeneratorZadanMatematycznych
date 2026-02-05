import type { Config, ValidationError } from '../../types';

interface RangeConfigProps {
  config: Config;
  onChange: (config: Config) => void;
  errors: ValidationError[];
}

export function RangeConfig({ config, onChange, errors }: RangeConfigProps) {
  const getError = (field: string) => errors.find(e => e.field === field)?.message;

  const handleChange = <K extends keyof Config>(field: K, value: Config[K]) => {
    onChange({ ...config, [field]: value });
  };

  return (
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
  );
}
