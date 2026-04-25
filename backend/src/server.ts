import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes.js';
import { initScheduler } from './services/schedulerService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

async function main(): Promise<void> {
    const app = express();

    app.use(cors());
    app.use(express.json());

    app.use('/api', routes);

    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Serve frontend static files (production / HA add-on mode)
    const FRONTEND_DIST = path.resolve(__dirname, 'public');
    app.use(express.static(FRONTEND_DIST));

    app.listen(PORT, () => {
        console.log(`[Server] Backend uruchomiony na http://localhost:${PORT}`);
        console.log(`[Server] API dostępne pod http://localhost:${PORT}/api`);
    });

    await initScheduler();
}

main().catch(console.error);
