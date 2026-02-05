import type { Config, ValidationError } from '../types';
import { AppearanceConfig } from './config/AppearanceConfig';
import { OperationsConfig } from './config/OperationsConfig';
import { RangeConfig } from './config/RangeConfig';

interface ConfigPanelProps {
  config: Config;
  onChange: (config: Config) => void;
  errors: ValidationError[];
}

export function ConfigPanel({ config, onChange, errors }: ConfigPanelProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-3">Konfiguracja</h2>
      
      <div className="space-y-3">
        <OperationsConfig config={config} onChange={onChange} errors={errors} />
        <RangeConfig config={config} onChange={onChange} errors={errors} />
        <AppearanceConfig config={config} onChange={onChange} errors={errors} />
      </div>
    </div>
  );
}
