import cron from 'node-cron';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { generatePdf, renderTasksToHtml } from './pdfService.js';
import { getAvailablePrinters, hasAlreadyPrintedToday, markAsPrintedToday, printPdf } from './printService.js';
import type { Config } from '../types.js';
import { generateDateSeed, generateTasks } from '../utils/generator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.resolve(__dirname, '../../data/config.json');
const PDF_OUTPUT_PATH = path.resolve(__dirname, '../../data/tasks.pdf');
const DATA_DIR = path.resolve(__dirname, '../../data');

const PRINTER_NAME = process.env.PRINTER_NAME || '';

async function loadConfig(): Promise<Config | null> {
    try {
        const data = await fs.readFile(CONFIG_PATH, 'utf-8');
        return JSON.parse(data) as Config;
    } catch {
        return null;
    }
}

export async function runAutoPrint(): Promise<void> {
    const config = await loadConfig();
    if (!config) {
        console.log('[AutoPrint] Brak zapisanej konfiguracji - pomijanie');
        return;
    }

    if (!config.autoPrintEnabled) {
        console.log('[AutoPrint] Automatyczne drukowanie wyłączone w konfiguracji');
        return;
    }

    const alreadyPrinted = await hasAlreadyPrintedToday();
    if (alreadyPrinted) {
        console.log('[AutoPrint] Już drukowano dzisiaj - pomijanie');
        return;
    }

    console.log('[AutoPrint] Generowanie zadań...');

    const dateSeed = generateDateSeed();
    const configWithDateSeed: Config = { ...config, seed: dateSeed };

    const tasks = generateTasks(configWithDateSeed);
    if (tasks.length === 0) {
        console.log('[AutoPrint] Nie wygenerowano żadnych zadań - sprawdź konfigurację');
        return;
    }

    console.log(`[AutoPrint] Wygenerowano ${tasks.length} zadań, seed: ${dateSeed}`);

    const html = renderTasksToHtml(tasks, configWithDateSeed);
    await fs.mkdir(DATA_DIR, { recursive: true });

    try {
        await generatePdf(html, PDF_OUTPUT_PATH);
        console.log(`[AutoPrint] PDF wygenerowany: ${PDF_OUTPUT_PATH}`);
    } catch (error) {
        console.error('[AutoPrint] Błąd generowania PDF:', error);
        return;
    }

    try {
        const printers = await getAvailablePrinters();
        if (printers.length === 0) {
            console.log('[AutoPrint] Nie znaleziono drukarek - PDF zapisany w:', PDF_OUTPUT_PATH);
            return;
        }

        const printerToUse = PRINTER_NAME || printers[0];
        console.log(`[AutoPrint] Drukowanie na: ${printerToUse}`);

        await printPdf(PDF_OUTPUT_PATH, printerToUse);
        await markAsPrintedToday();

        console.log('[AutoPrint] Drukowanie zakończone pomyślnie!');
    } catch (error) {
        console.error('[AutoPrint] Błąd drukowania:', error);
        console.log('[AutoPrint] PDF zapisany w:', PDF_OUTPUT_PATH);
    }
}

function parsePrintTime(time: string): { hour: number; minute: number } | null {
    const match = time.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    const hour = parseInt(match[1]);
    const minute = parseInt(match[2]);
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
    return { hour, minute };
}

let scheduledJob: cron.ScheduledTask | null = null;

export function scheduleAutoPrint(enabled: boolean, time: string): void {
    if (scheduledJob) {
        scheduledJob.stop();
        scheduledJob = null;
    }

    if (!enabled) {
        console.log('[AutoPrint] Harmonogram zatrzymany');
        return;
    }

    const parsed = parsePrintTime(time);
    if (!parsed) {
        console.warn(`[AutoPrint] Nieprawidłowy format czasu: "${time}" — oczekiwano HH:MM`);
        return;
    }

    const { hour, minute } = parsed;
    const cronExpr = `${minute} ${hour} * * *`;

    scheduledJob = cron.schedule(cronExpr, async () => {
        console.log(`[AutoPrint] Uruchamianie zaplanowanego drukowania (${time})...`);
        try {
            await runAutoPrint();
        } catch (error) {
            console.error('[AutoPrint] Nieoczekiwany błąd:', error);
        }
    });

    console.log(`[AutoPrint] Zaplanowano drukowanie na ${time} (cron: "${cronExpr}")`);
}

export async function initScheduler(): Promise<void> {
    const config = await loadConfig();
    if (!config) {
        console.log('[AutoPrint] Brak konfiguracji - harmonogram nieaktywny');
        return;
    }
    scheduleAutoPrint(config.autoPrintEnabled, config.autoPrintTime);
}
