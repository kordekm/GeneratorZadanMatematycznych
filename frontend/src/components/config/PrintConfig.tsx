import type { Config } from '../../types';

interface PrintConfigProps {
  config: Config;
  onChange: (config: Config) => void;
}

export function PrintConfig({ config, onChange }: PrintConfigProps) {
  const handleChange = <K extends keyof Config>(field: K, value: Config[K]) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <section>
      <h3 className="text-base font-semibold mb-2">Automatyczne drukowanie</h3>

      <div className="space-y-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="autoPrintEnabled"
            checked={config.autoPrintEnabled}
            onChange={(e) => handleChange('autoPrintEnabled', e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="autoPrintEnabled" className="text-sm font-medium">
            Drukuj codziennie nowe zadania
          </label>
        </div>

        {config.autoPrintEnabled && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Godzina drukowania
            </label>
            <input
              type="time"
              value={config.autoPrintTime}
              onChange={(e) => handleChange('autoPrintTime', e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
        )}
      </div>
    </section>
  );
}
