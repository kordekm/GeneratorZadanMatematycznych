import type { Config, ValidationError } from '../types';
import { AdditionConfig } from './config/AdditionConfig';
import { AppearanceConfig } from './config/AppearanceConfig';
import { MultiplicationConfigPanel } from './config/MultiplicationConfig';
import { SubtractionConfig } from './config/SubtractionConfig';

interface ConfigPanelProps {
  config: Config;
  onChange: (config: Config) => void;
  errors: ValidationError[];
}

export function ConfigPanel({ config, onChange, errors }: ConfigPanelProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-3">Konfiguracja</h2>
      
      <div className="space-y-6">
        <AdditionConfig config={config} onChange={onChange} />
        <SubtractionConfig config={config} onChange={onChange} />
        <MultiplicationConfigPanel config={config} onChange={onChange} errors={errors} />
        <AppearanceConfig config={config} onChange={onChange} errors={errors} />
      </div>
    </div>
  );
}
