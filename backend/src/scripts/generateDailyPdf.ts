import 'dotenv/config';
import { generateDailyPdfFromSavedConfig } from '../services/dailyPdfService.js';

async function main(): Promise<void> {
    const result = await generateDailyPdfFromSavedConfig();

    console.log('PDF wygenerowany');
    console.log(`Seed: ${result.seed}`);
    console.log(`Liczba zadań: ${result.taskCount}`);
}

main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Błąd generowania PDF: ${message}`);
    process.exitCode = 1;
});
