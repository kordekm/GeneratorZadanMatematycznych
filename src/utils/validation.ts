import type { Config, ValidationError } from '../types';

export function validateConfig(config: Config): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validacja Dodawania
    if (config.addition.enabled) {
        if (config.addition.minValue > config.addition.maxValue) {
            errors.push({
                field: 'addition.minValue',
                message: 'Wartość min > max'
            });
        }
        if (config.addition.minValue < 0) {
            errors.push({
                field: 'addition.minValue',
                message: 'Wartość nie może być ujemna'
            });
        }
        if (config.addition.minTerms < 2) {
            errors.push({
                field: 'addition.minTerms',
                message: 'Min. 2 składniki'
            });
        }
        if (config.addition.maxTerms > 8) {
            errors.push({
                field: 'addition.maxTerms',
                message: 'Max. 8 składników'
            });
        }
        if (config.addition.minTerms > config.addition.maxTerms) {
            errors.push({
                field: 'addition.minTerms',
                message: 'Min > Max składników'
            });
        }
    }

    // Validacja Odejmowania
    if (config.subtraction.enabled) {
        if (config.subtraction.minValue > config.subtraction.maxValue) {
            errors.push({
                field: 'subtraction.minValue',
                message: 'Wartość min > max'
            });
        }
        if (config.subtraction.minValue < 0) {
            errors.push({
                field: 'subtraction.minValue',
                message: 'Wartość nie może być ujemna'
            });
        }
    }

    // Validacja ogólna
    if (config.fontSize < 18) {
        errors.push({
            field: 'fontSize',
            message: 'Min. czcionka 18px'
        });
    }

    if (config.fontSize > 72) {
        errors.push({
            field: 'fontSize',
            message: 'Max. czcionka 72px'
        });
    }

    const totalCount =
        (config.addition.enabled ? config.addition.count : 0) +
        (config.subtraction.enabled ? config.subtraction.count : 0) +
        (config.multiplication.enabled ? config.multiplication.count : 0);

    if (totalCount === 0) {
        // Warning or error? Let's generic error if user tries to generate
        // but maybe we don't strictly enforce it in live validation to avoid annoying red text while typing.
        // But for printing/generating it matters.
    }

    if (totalCount > 200) {
        errors.push({
            field: 'general',
            message: 'Maks. 200 zadań łącznie'
        });
    }

    if (!config.seed || config.seed.trim() === '') {
        errors.push({
            field: 'seed',
            message: 'Seed wymagany'
        });
    }

    return errors;
}
