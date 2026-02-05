import type { Config, ValidationError } from '../types';

export function validateConfig(config: Config): ValidationError[] {
    const errors: ValidationError[] = [];

    if (config.minValue > config.maxValue) {
        errors.push({
            field: 'minValue',
            message: 'Wartość minimalna nie może być większa od maksymalnej'
        });
    }

    if (config.minValue < 0) {
        errors.push({
            field: 'minValue',
            message: 'Wartość minimalna nie może być ujemna'
        });
    }

    if (config.maxValue > 999999) {
        errors.push({
            field: 'maxValue',
            message: 'Wartość maksymalna nie może przekraczać 999999'
        });
    }

    if (config.minTerms < 2) {
        errors.push({
            field: 'minTerms',
            message: 'Minimalna liczba składników to 2'
        });
    }

    if (config.maxTerms > 8) {
        errors.push({
            field: 'maxTerms',
            message: 'Maksymalna liczba składników to 8'
        });
    }

    if (config.minTerms > config.maxTerms) {
        errors.push({
            field: 'minTerms',
            message: 'Min. składników nie może być większe od max.'
        });
    }

    if (config.taskCount < 5) {
        errors.push({
            field: 'taskCount',
            message: 'Minimalna liczba zadań to 5'
        });
    }

    if (config.taskCount > 200) {
        errors.push({
            field: 'taskCount',
            message: 'Maksymalna liczba zadań to 200'
        });
    }

    if (config.fontSize < 18) {
        errors.push({
            field: 'fontSize',
            message: 'Minimalny rozmiar czcionki to 18px'
        });
    }

    if (config.fontSize > 72) {
        errors.push({
            field: 'fontSize',
            message: 'Maksymalny rozmiar czcionki to 72px'
        });
    }

    if (!config.seed || config.seed.trim() === '') {
        errors.push({
            field: 'seed',
            message: 'Seed nie może być pusty'
        });
    }

    const totalOperations = config.operations.addition + config.operations.subtraction;
    if (totalOperations === 0) {
        errors.push({
            field: 'operations',
            message: 'Musisz wybrać przynajmniej jedno działanie'
        });
    }

    if (config.operations.addition < 0 || config.operations.subtraction < 0) {
        errors.push({
            field: 'operations',
            message: 'Proporcje działań nie mogą być ujemne'
        });
    }

    return errors;
}
