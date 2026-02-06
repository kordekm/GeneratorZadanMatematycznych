import { useEffect, useState } from 'react';
import { ConfigPanel } from './components/ConfigPanel';
import { Preview } from './components/Preview';
import { useTaskGenerator } from './hooks/useTaskGenerator';
import type { Config, ValidationError } from './types';
import { generateSeed } from './utils/generator';
import { loadConfig, saveConfig } from './utils/localStorage';

const DEFAULT_CONFIG: Config = {
  // Visual settings
  fontSize: 32,
  gridMode: 'light',
  orientation: 'portrait',
  columns: 4,
  showTaskNumbers: true,
  showAnswers: 'none',
  showHeader: true,
  
  // Logic settings
  carryMode: 'any',
  seed: generateSeed(),
  
  // Operations
  addition: {
    enabled: true,
    count: 20,
    minTerms: 2,
    maxTerms: 2,
    minValue: 10,
    maxValue: 99
  },
  subtraction: {
    enabled: true,
    count: 0,
    minValue: 10,
    maxValue: 99,
    allowNegativeResults: false
  },
  multiplication: {
    enabled: false,
    count: 0,
    factor1Digits: 3,
    factor2Digits: 2,
  },
  division: {
    enabled: false,
    count: 0,
    dividendDigits: 3,
    divisorDigits: 1,
    allowRemainder: true
  }
};

function App() {
  const [config, setConfig] = useState<Config>(() => {
    const savedConfig = loadConfig();
    if (savedConfig) {
      // Merge with DEFAULT_CONFIG to handle new fields added after saving
      return { 
        ...DEFAULT_CONFIG, 
        ...savedConfig,
        // Ensure nested objects are also merged properly
        addition: { ...DEFAULT_CONFIG.addition, ...savedConfig.addition },
        subtraction: { ...DEFAULT_CONFIG.subtraction, ...savedConfig.subtraction },
        multiplication: { ...DEFAULT_CONFIG.multiplication, ...savedConfig.multiplication },
        division: { ...DEFAULT_CONFIG.division, ...savedConfig.division }
      };
    }
    return DEFAULT_CONFIG;
  });
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const { tasks, isGenerating, error: generatorError, generate } = useTaskGenerator();

  // Save configuration to localStorage whenever it changes
  useEffect(() => {
    saveConfig(config);
  }, [config]);

  useEffect(() => {
    // Basic validation to ensure total count > 0 if we want to enforce it, 
    // or just let the generator handle empty lists. 
    // For now we skip complex validation or implement a simpler one.
     const validationErrors: ValidationError[] = []; // validateConfig(config);
     setErrors(validationErrors);
    
    if (validationErrors.length === 0) {
      const timeoutId = setTimeout(() => {
        generate(config);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [config, generate]);

  const handlePrint = () => {
    if (tasks.length === 0) return;
    window.print();
  };

  const handleNewSet = () => {
    setConfig(prev => ({
      ...prev,
      seed: generateSeed()
    }));
  };

  const getTitle = () => {
    const hasAddition = config.addition.count > 0;
    const hasSubtraction = config.subtraction.count > 0;
    const hasMultiplication = config.multiplication.enabled && config.multiplication.count > 0;
    const hasDivision = config.division.enabled && config.division.count > 0;
    
    const activeOperations = [
        hasAddition && 'Dodawanie',
        hasSubtraction && 'Odejmowanie',
        hasMultiplication && 'Mnożenie',
        hasDivision && 'Dzielenie'
    ].filter(Boolean);

    if (activeOperations.length === 0) return 'Generator Kart Pracy - Działania w Słupkach';
    if (activeOperations.length === 1) return `Generator Kart Pracy - ${activeOperations[0]} w Słupkach`;
    
    return 'Generator Kart Pracy - Działania w Słupkach';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white py-8 shadow-lg relative overflow-hidden">
        {/* Mathematical decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <span className="absolute top-4 left-[10%] text-7xl opacity-20 font-bold text-white">+</span>
          <span className="absolute top-8 right-[15%] text-6xl opacity-20 font-bold text-white">−</span>
          <span className="absolute bottom-6 left-[25%] text-8xl opacity-15 font-bold text-white">×</span>
          <span className="absolute bottom-4 right-[30%] text-6xl opacity-20 font-bold text-white">÷</span>
          <span className="absolute top-1/2 left-[45%] text-5xl opacity-20 font-bold text-white">+</span>
          <span className="absolute top-6 right-[45%] text-7xl opacity-15 font-bold text-white">×</span>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{getTitle()}</h1>
              <p className="text-white/90 mt-2">Twórz spersonalizowane karty pracy z działaniami pisemnymi</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleNewSet}
                className="px-6 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white rounded-lg hover:bg-white/30 font-semibold shadow-lg transition no-print"
              >
                🔄 Nowy zestaw
              </button>
              <button
                onClick={handlePrint}
                disabled={tasks.length === 0 || errors.length > 0}
                className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-50 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed font-semibold shadow-lg transition no-print"
              >
                🖨️ Drukuj zadania
              </button>
            </div>
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
