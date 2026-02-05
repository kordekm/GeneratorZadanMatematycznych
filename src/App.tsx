import { useEffect, useState } from 'react';
import { ConfigPanel } from './components/ConfigPanel';
import { Preview } from './components/Preview';
import type { Config, Task, ValidationError } from './types';
import { generateSeed, generateTasks, GeneratorError } from './utils/generator';
import { validateConfig } from './utils/validation';

const DEFAULT_CONFIG: Config = {
  minValue: 10,
  maxValue: 99,
  minTerms: 2,
  maxTerms: 3,
  taskCount: 20,
  carryMode: 'any',
  fontSize: 32,
  gridMode: 'light',
  orientation: 'portrait',
  columns: 4,
  showTaskNumbers: true,
  showAnswers: 'none',
  showHeader: true,
  seed: generateSeed(),
  operations: {
    addition: 100,
    subtraction: 0,
  },
  allowNegativeResults: false,
};

function App() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [generatorError, setGeneratorError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const validationErrors = validateConfig(config);
    setErrors(validationErrors);
    
    if (validationErrors.length === 0) {
      setIsGenerating(true);
      setGeneratorError(null);
      
      const timeoutId = setTimeout(() => {
        try {
          const newTasks = generateTasks(
            config.taskCount,
            config.minValue,
            config.maxValue,
            config.minTerms,
            config.maxTerms,
            config.carryMode,
            config.seed,
            config.operations,
            config.allowNegativeResults
          );
          setTasks(newTasks);
          setGeneratorError(null);
        } catch (error) {
          if (error instanceof GeneratorError) {
            setGeneratorError(error.message);
            setTasks([]);
          } else {
            console.error('Unexpected error:', error);
            setGeneratorError('Wystąpił nieoczekiwany błąd');
            setTasks([]);
          }
        } finally {
          setIsGenerating(false);
        }
      }, 300);
      
      return () => clearTimeout(timeoutId);
    } else {
      setTasks([]);
      setIsGenerating(false);
    }
  }, [config.taskCount, config.minValue, config.maxValue, config.minTerms, config.maxTerms, config.carryMode, config.seed, config.operations, config.allowNegativeResults]);

  const handlePrint = () => {
    if (tasks.length === 0) return;
    window.print();
  };

  const getTitle = () => {
    const { addition, subtraction } = config.operations;
    const total = addition + subtraction;
    
    if (total === 0) return 'Generator Kart Pracy - Działania w Słupkach';
    
    const hasAddition = addition > 0;
    const hasSubtraction = subtraction > 0;

    if (hasAddition && hasSubtraction) {
      return 'Generator Kart Pracy - Dodawanie i Odejmowanie w Słupkach';
    }
    
    if (hasAddition && !hasSubtraction) {
      return 'Generator Kart Pracy - Dodawanie w Słupkach';
    }
    
    if (hasSubtraction && !hasAddition) {
      return 'Generator Kart Pracy - Odejmowanie w Słupkach';
    }
    
    return 'Generator Kart Pracy - Działania w Słupkach';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{getTitle()}</h1>
              <p className="text-blue-100 mt-2">Twórz spersonalizowane karty pracy z działaniami pisemnymi</p>
            </div>
            <button
              onClick={handlePrint}
              disabled={tasks.length === 0 || errors.length > 0}
              className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed font-semibold shadow-lg transition no-print"
            >
              🖨️ Drukuj zadania
            </button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {generatorError && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded no-print">
            <strong className="font-bold">Błąd generowania: </strong>
            <span>{generatorError}</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1 no-print">
            <ConfigPanel 
              config={config} 
              onChange={setConfig} 
              errors={errors}
            />
          </div>
          
          <div className="lg:col-span-2">
            {isGenerating ? (
              <div className="bg-white rounded-lg shadow-lg p-8 flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Generowanie zadań...</p>
                </div>
              </div>
            ) : (
              <Preview config={config} tasks={tasks} />
            )}
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white py-4 mt-12">
        <div className="container mx-auto px-4 text-center text-sm">
          Generator Kart Pracy © 2026 • Wykonane z ❤️ dla nauczycieli i rodziców
        </div>
      </footer>
    </div>
  );
}

export default App;
