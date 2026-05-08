import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Config } from '../types.js';
import { generateDateSeed, generateTasks } from '../utils/generator.js';
import { generatePdf, renderTasksToHtml } from './pdfService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.resolve(__dirname, '../../data/config.json');
const DATA_DIR = path.resolve(__dirname, '../../data');
const DAILY_PDF_PATH = path.join(DATA_DIR, 'tasks.pdf');

export interface DailyPdfResult {
    path: string;
    seed: string;
    taskCount: number;
}

export async function generateDailyPdfFromSavedConfig(): Promise<DailyPdfResult> {
    const data = await fs.readFile(CONFIG_PATH, 'utf-8');
    const savedConfig: Config = JSON.parse(data);
    const seed = generateDateSeed();
    const config: Config = { ...savedConfig, seed };

    const tasks = generateTasks(config);
    if (tasks.length === 0) {
        throw new Error('Nie wygenerowano żadnych zadań');
    }

    const html = renderTasksToHtml(tasks, config);

    await fs.mkdir(DATA_DIR, { recursive: true });
    await generatePdf(html, DAILY_PDF_PATH);

    return {
        path: DAILY_PDF_PATH,
        seed,
        taskCount: tasks.length,
    };
}
