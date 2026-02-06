import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Config, Task } from '../types.js';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.resolve(__dirname, '../../templates');
const DATA_DIR = path.resolve(__dirname, '../../data');

function getTaskLineCount(task: Task): number {
    const isMultiplication = task.operations.includes('*');

    if (!isMultiplication) {
        return task.numbers.length + 1;
    } else {
        const n2 = task.numbers[1];
        const n2Digits = Math.abs(n2).toString().length;

        if (n2Digits > 1) {
            return 2 + n2Digits + 1;
        } else {
            return 2 + 1;
        }
    }
}

function getTaskGridWidth(task: Task): number {
    const isMultiplication = task.operations.includes('*');

    if (!isMultiplication) {
        return Math.max(...task.numbers.map(n => Math.abs(n).toString().length), task.answer.toString().length);
    } else {
        const n1 = task.numbers[0];
        const n2 = task.numbers[1];
        const n2Digits = Math.abs(n2).toString().split('').map(Number).reverse();

        let maxWidth = Math.max(
            Math.abs(n1).toString().length,
            Math.abs(n2).toString().length,
            task.answer.toString().length
        );

        n2Digits.forEach((d, i) => {
            const partialVal = n1 * d;
            const partialWidth = Math.abs(partialVal).toString().length + i;
            maxWidth = Math.max(maxWidth, partialWidth);
        });

        return maxWidth;
    }
}

function getMaxGridWidth(tasks: Task[]): number {
    if (tasks.length === 0) return 1;
    return Math.max(...tasks.map(t => getTaskGridWidth(t)));
}

interface TaskRow {
    number: number;
    operation: string | null;
    isResult: boolean;
    isPartial: boolean;
    offset: number;
    hasLineBelow: boolean;
    isDivisionQuotient?: boolean;
    isDivisionDividend?: boolean;
    remainder?: number;
    divisor?: number;
}

function getTaskRows(task: Task): TaskRow[] {
    const isMultiplication = task.operations.includes('*');
    const isDivision = task.operations.includes('÷');

    if (isDivision) {
        const dividend = task.numbers[0];
        const divisor = task.numbers[1];
        const quotient = task.answer;
        const remainder = task.remainder || 0;
        
        const dividendStr = dividend.toString();
        const steps: Array<{ type: 'subtract' | 'result'; value: number; position: number }> = [];
        let currentDividend = 0;
        
        for (let i = 0; i < dividendStr.length; i++) {
            currentDividend = currentDividend * 10 + parseInt(dividendStr[i]);
            if (currentDividend >= divisor) {
                const digitQuotient = Math.floor(currentDividend / divisor);
                const product = digitQuotient * divisor;
                const stepRemainder = currentDividend - product;
                steps.push({ type: 'subtract', value: product, position: i });
                if (stepRemainder > 0 || i < dividendStr.length - 1) {
                    steps.push({ type: 'result', value: stepRemainder, position: i });
                }
                currentDividend = stepRemainder;
            }
        }
        
        const dividendLength = dividend.toString().length;
        const rows: TaskRow[] = [
            {
                number: quotient, operation: null, isResult: true, isPartial: false,
                offset: 0, hasLineBelow: true, isDivisionQuotient: true,
                remainder: remainder > 0 ? remainder : undefined
            },
            {
                number: dividend, operation: '÷', isResult: false, isPartial: false,
                offset: 0, hasLineBelow: false, isDivisionDividend: true, divisor: divisor
            }
        ];
        
        steps.forEach((step) => {
            const rightAlignPosition = step.position + 1;
            const offset = Math.max(0, dividendLength - rightAlignPosition);
            if (step.type === 'subtract') {
                rows.push({
                    number: step.value, operation: '-', isResult: false, isPartial: true,
                    offset: offset, hasLineBelow: true
                });
            } else {
                rows.push({
                    number: step.value, operation: null, isResult: false, isPartial: true,
                    offset: offset, hasLineBelow: false
                });
            }
        });
        
        return rows;
    } else if (!isMultiplication) {
        return [
            ...task.numbers.map((num, idx) => ({
                number: num,
                operation: idx === 0 ? null : task.operations[idx - 1],
                isResult: false,
                isPartial: false,
                offset: 0,
                hasLineBelow: idx === task.numbers.length - 1
            })),
            {
                number: task.answer, operation: null, isResult: true,
                isPartial: false, offset: 0, hasLineBelow: false
            }
        ];
    } else {
        const n1 = task.numbers[0];
        const n2 = task.numbers[1];
        const n2Digits = Math.abs(n2).toString().split('').map(Number).reverse();
        const partials = n2Digits.map((d, i) => ({ val: n1 * d, offset: i }));

        const rows: TaskRow[] = [
            { number: n1, operation: null, isResult: false, isPartial: false, offset: 0, hasLineBelow: false },
            { number: n2, operation: '*', isResult: false, isPartial: false, offset: 0, hasLineBelow: true }
        ];

        if (partials.length > 1) {
            partials.forEach((p, idx) => {
                rows.push({
                    number: p.val, operation: null, isResult: false, isPartial: true,
                    offset: p.offset, hasLineBelow: idx === partials.length - 1
                });
            });
        }

        rows.push({
            number: task.answer, operation: null, isResult: true,
            isPartial: false, offset: 0, hasLineBelow: false
        });

        return rows;
    }
}

function renderTaskToHtml(task: Task, config: Config, maxGridWidth: number): string {
    const fontSize = config.fontSize;
    const lineHeight = fontSize * 1.4;
    const cellWidth = fontSize * 0.65;
    const rows = getTaskRows(task);
    const gridMode = config.gridMode;

    let cellBorder = 'none';
    if (gridMode === 'light') cellBorder = '1px solid #d0d0d0';
    if (gridMode === 'medium') cellBorder = '1px solid #808080';

    const isDivision = task.operations.includes('÷');

    let html = `<div style="margin-bottom: 24px; ${isDivision ? 'margin-right: 60px;' : ''}">`;
    
    if (config.showTaskNumbers) {
        html += `<div style="font-family: 'Roboto Mono', monospace; margin-bottom: 8px; font-size: ${fontSize * 0.7}px;">${task.id}.</div>`;
    }

    html += `<div style="font-family: 'Roboto Mono', monospace; font-size: ${fontSize}px;">`;

    for (const row of rows) {
        const numStr = Math.abs(row.number).toString();
        const digits = numStr.split('');
        const totalCells = maxGridWidth;
        const leftPadding = Math.max(0, totalCells - (digits.length + row.offset));
        const shouldHideContent = (row.isResult || row.isPartial) && config.showAnswers === 'none';
        
        const contentCells = digits.length + row.offset;
        const lineStartPosition = fontSize + (leftPadding * cellWidth);
        const lineExtension = cellWidth * 0.3;
        const lineWidth = (contentCells * cellWidth) + lineExtension;

        html += `<div style="position: relative;">`;
        html += `<div style="display: grid; grid-template-columns: ${fontSize}px repeat(${totalCells}, ${cellWidth}px); margin-bottom: ${row.hasLineBelow ? '2px' : '0'};">`;

        // Operation cell
        const opText = row.isDivisionDividend ? '' : (!row.isResult && !row.isPartial && row.operation ? row.operation : '');
        html += `<div style="display: flex; align-items: center; justify-content: center; height: ${lineHeight}px;">${opText}</div>`;

        // Left padding cells
        for (let i = 0; i < leftPadding; i++) {
            html += `<div style="border: ${cellBorder}; height: ${lineHeight}px; display: flex; align-items: center; justify-content: center; box-sizing: border-box;">&nbsp;</div>`;
        }

        // Digit cells
        for (let i = 0; i < digits.length; i++) {
            const isLastDigit = i === digits.length - 1;
            const showDivisorHere = isLastDigit && row.isDivisionDividend && row.divisor !== undefined;
            const color = shouldHideContent ? 'transparent' : 'inherit';
            
            html += `<div style="border: ${cellBorder}; height: ${lineHeight}px; display: flex; align-items: center; justify-content: center; color: ${color}; box-sizing: border-box; position: relative;">`;
            html += digits[i];
            if (showDivisorHere) {
                html += `<span style="position: absolute; left: 100%; white-space: nowrap;">:${row.divisor}</span>`;
            }
            html += `</div>`;
        }

        // Remainder display for division quotient
        if (row.isDivisionQuotient && row.remainder !== undefined && !shouldHideContent) {
            const spanCols = Math.max(1, totalCells - digits.length);
            html += `<div style="grid-column: span ${spanCols}; display: flex; align-items: center; padding-left: 8px; font-size: ${fontSize * 0.9}px;">r. ${row.remainder}</div>`;
        }

        // Right padding (offset) cells
        for (let i = 0; i < row.offset; i++) {
            html += `<div style="border: ${cellBorder}; height: ${lineHeight}px; display: flex; align-items: center; justify-content: center; color: transparent; box-sizing: border-box;"></div>`;
        }

        html += `</div>`; // close grid

        // Horizontal line below content
        if (row.hasLineBelow) {
            html += `<div style="position: absolute; left: ${lineStartPosition}px; bottom: 2px; width: ${lineWidth}px; border-bottom: 2px solid black;"></div>`;
        }

        html += `</div>`; // close relative div
    }

    html += `</div></div>`;
    return html;
}

export function renderTasksToHtml(tasks: Task[], config: Config): string {
    const maxGridWidth = getMaxGridWidth(tasks);
    
    const orientation = config.orientation === 'portrait' ? 'portrait' : 'landscape';
    
    let tasksHtml = '';
    for (const task of tasks) {
        tasksHtml += renderTaskToHtml(task, config, maxGridWidth);
    }

    return `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        @page {
            size: A4 ${orientation};
            margin: 1cm;
        }
        body {
            margin: 0;
            padding: 20px;
            font-family: 'Roboto Mono', monospace;
            background: white;
        }
        .tasks-grid {
            display: grid;
            grid-template-columns: repeat(${config.columns}, 1fr);
            gap: 2rem;
        }
    </style>
</head>
<body>
    <div class="tasks-grid">
        ${tasksHtml}
    </div>
</body>
</html>`;
}

export async function generatePdf(htmlContent: string, outputPath: string): Promise<void> {
    const tmpHtmlPath = path.join(DATA_DIR, 'tmp-tasks.html');
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(tmpHtmlPath, htmlContent, 'utf-8');

    try {
        // Try wkhtmltopdf first (lighter)
        await execAsync(`wkhtmltopdf --enable-local-file-access --quiet "${tmpHtmlPath}" "${outputPath}"`);
        console.log('[PdfService] PDF wygenerowany przez wkhtmltopdf');
    } catch {
        try {
            // Fallback: try chromium/google-chrome headless
            const browsers = ['chromium-browser', 'chromium', 'google-chrome', 'google-chrome-stable'];
            let browserFound = false;
            
            for (const browser of browsers) {
                try {
                    await execAsync(`which ${browser}`);
                    await execAsync(`${browser} --headless --disable-gpu --no-sandbox --print-to-pdf="${outputPath}" "file://${tmpHtmlPath}"`);
                    console.log(`[PdfService] PDF wygenerowany przez ${browser}`);
                    browserFound = true;
                    break;
                } catch {
                    continue;
                }
            }
            
            if (!browserFound) {
                throw new Error('Nie znaleziono narzędzia do generowania PDF. Zainstaluj wkhtmltopdf lub chromium: sudo apt install wkhtmltopdf');
            }
        } catch (error) {
            throw error;
        }
    } finally {
        try {
            await fs.unlink(tmpHtmlPath);
        } catch {
            // ignore cleanup errors
        }
    }
}
