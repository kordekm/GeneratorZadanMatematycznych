import cors from 'cors';
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes.js';
import { generatePdf, renderTasksToHtml } from './services/pdfService.js';
import { getAvailablePrinters, markAsPrintedToday, printPdf } from './services/printService.js';
import type { Config } from './types.js';
import { generateDateSeed, generateTasks } from './utils/generator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.resolve(__dirname, '../data/config.json');
const PDF_OUTPUT_PATH = path.resolve(__dirname, '../data/tasks.pdf');
const DATA_DIR = path.resolve(__dirname, '../data');

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const PRINTER_NAME = process.env.PRINTER_NAME || '';

async function loadConfig(): Promise<Config | null> {
    try {
        const data = await fs.readFile(CONFIG_PATH, 'utf-8');
        return JSON.parse(data) as Config;
    } catch {
        return null;
    }
}

async function autoPrintOnStartup(): Promise<void> {
    console.log('[Startup] Sprawdzanie automatycznego drukowania...');

    const alreadyPrinted = true; //= await hasAlreadyPrintedToday();
    if (alreadyPrinted) {
        console.log('[Startup] Już drukowano dzisiaj - pomijanie');
        return;
    }

    const config = await loadConfig();
    if (!config) {
        console.log('[Startup] Brak zapisanej konfiguracji - pomijanie automatycznego drukowania');
        console.log('[Startup] Zapisz konfigurację przez frontend (POST /api/config) aby włączyć automatyczne drukowanie');
        return;
    }

    console.log('[Startup] Znaleziono konfigurację - generowanie zadań...');

    // Use date-based seed for daily deterministic generation
    const dateSeed = generateDateSeed();
    const configWithDateSeed: Config = { ...config, seed: dateSeed };

    console.log(`[Startup] Seed na dzisiaj: ${dateSeed}`);

    const tasks = generateTasks(configWithDateSeed);
    if (tasks.length === 0) {
        console.log('[Startup] Nie wygenerowano żadnych zadań - sprawdź konfigurację');
        return;
    }

    console.log(`[Startup] Wygenerowano ${tasks.length} zadań`);

    // Render to HTML and generate PDF
    const html = renderTasksToHtml(tasks, configWithDateSeed);

    await fs.mkdir(DATA_DIR, { recursive: true });

    try {
        await generatePdf(html, PDF_OUTPUT_PATH);
        console.log(`[Startup] PDF wygenerowany: ${PDF_OUTPUT_PATH}`);
    } catch (error) {
        console.error('[Startup] Błąd generowania PDF:', error);
        console.log('[Startup] Pomijanie drukowania z powodu błędu PDF');
        return;
    }

    // Print
    try {
        const printers = await getAvailablePrinters();
        if (printers.length === 0) {
            console.log('[Startup] Nie znaleziono drukarek - pomijanie drukowania');
            console.log('[Startup] PDF zapisany w:', PDF_OUTPUT_PATH);
            return;
        }

        const printerToUse = PRINTER_NAME || printers[0];
        console.log(`[Startup] Drukowanie na: ${printerToUse}`);

        await printPdf(PDF_OUTPUT_PATH, printerToUse);
        await markAsPrintedToday();

        console.log('[Startup] Drukowanie zakończone pomyślnie!');
    } catch (error) {
        console.error('[Startup] Błąd drukowania:', error);
        console.log('[Startup] PDF zapisany w:', PDF_OUTPUT_PATH);
    }
}

async function main(): Promise<void> {
    const app = express();

    app.use(cors());
    app.use(express.json());

    // API routes
    app.use('/api', routes);

    // Health check
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Serve frontend static files (production / HA add-on mode)
    const FRONTEND_DIST = path.resolve(__dirname, 'public');
    app.use(express.static(FRONTEND_DIST));
    app.get('*', (_req, res) => {
        res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
    });

    // Start server
    app.listen(PORT, () => {
        console.log(`[Server] Backend uruchomiony na http://localhost:${PORT}`);
        console.log(`[Server] API dostępne pod http://localhost:${PORT}/api`);
    });

    // Auto-print on startup (non-blocking)
    try {
        await autoPrintOnStartup();
    } catch (error) {
        console.error('[Startup] Nieoczekiwany błąd automatycznego drukowania:', error);
    }
}

main().catch(console.error);
