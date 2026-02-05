import type { Config, ValidationError } from '../../types';

interface OperationsConfigProps {
  config: Config;
  onChange: (config: Config) => void;
  errors: ValidationError[];
}

export function OperationsConfig({ config, onChange, errors }: OperationsConfigProps) {
  const getError = (field: string) => errors.find(e => e.field === field)?.message;

  const handleOperationsChange = (type: 'addition' | 'subtraction', value: number) => {
    onChange({
      ...config,
      operations: {
        ...config.operations,
        [type]: value
      }
    });
  };

  const handleAllowNegativeChange = (checked: boolean) => {
    onChange({
      ...config,
      allowNegativeResults: checked
    });
  };

  return (
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
            onChange={(e) => handleOperationsChange('addition', parseInt(e.target.value) || 0)}
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
            onChange={(e) => handleOperationsChange('subtraction', parseInt(e.target.value) || 0)}
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
              onChange={(e) => handleAllowNegativeChange(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="allowNegativeResults" className="text-sm font-medium">
              Zezwól na wyniki ujemne
            </label>
          </div>
        )}
      </div>
    </section>
  );
}
