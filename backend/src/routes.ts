import { Router } from 'express';
import type { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Config } from './types.js';
import { generateTasks } from './utils/generator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.resolve(__dirname, '../data/config.json');
const DATA_DIR = path.resolve(__dirname, '../data');

const router = Router();

// POST /api/generate - generowanie zadań na podstawie konfiguracji
router.post('/generate', (req: Request, res: Response) => {
    try {
        const config: Config = req.body;

        if (!config || !config.seed) {
            res.status(400).json({ error: 'Brak konfiguracji lub seed' });
            return;
        }

        const tasks = generateTasks(config);
        res.json({ tasks });
    } catch (error) {
        console.error('[API] Błąd generowania:', error);
        res.status(500).json({ error: 'Błąd generowania zadań' });
    }
});

// POST /api/config - zapisanie konfiguracji do pliku
router.post('/config', async (req: Request, res: Response) => {
    try {
        const config: Config = req.body;

        if (!config) {
            res.status(400).json({ error: 'Brak konfiguracji' });
            return;
        }

        await fs.mkdir(DATA_DIR, { recursive: true });
        await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');

        console.log('[API] Konfiguracja zapisana do', CONFIG_PATH);
        res.json({ success: true, message: 'Konfiguracja zapisana' });
    } catch (error) {
        console.error('[API] Błąd zapisu konfiguracji:', error);
        res.status(500).json({ error: 'Błąd zapisu konfiguracji' });
    }
});

// GET /api/config - pobranie aktualnej konfiguracji
router.get('/config', async (_req: Request, res: Response) => {
    try {
        const data = await fs.readFile(CONFIG_PATH, 'utf-8');
        const config: Config = JSON.parse(data);
        res.json(config);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            res.status(404).json({ error: 'Brak zapisanej konfiguracji' });
        } else {
            console.error('[API] Błąd odczytu konfiguracji:', error);
            res.status(500).json({ error: 'Błąd odczytu konfiguracji' });
        }
    }
});

export default router;
