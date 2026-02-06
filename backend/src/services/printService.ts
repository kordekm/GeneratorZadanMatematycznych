import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../../data');
const LAST_PRINT_FILE = path.join(DATA_DIR, 'last-print.txt');

export function getTodayDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export async function hasAlreadyPrintedToday(): Promise<boolean> {
    try {
        const lastDate = await fs.readFile(LAST_PRINT_FILE, 'utf-8');
        return lastDate.trim() === getTodayDateString();
    } catch {
        return false;
    }
}

export async function markAsPrintedToday(): Promise<void> {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(LAST_PRINT_FILE, getTodayDateString(), 'utf-8');
}

export async function printPdf(pdfPath: string, printerName?: string): Promise<void> {
    const printerArg = printerName ? `-d ${printerName}` : '';
    const command = `lp ${printerArg} "${pdfPath}"`;
    
    console.log(`[PrintService] Drukowanie: ${command}`);
    
    try {
        const { stdout, stderr } = await execAsync(command);
        if (stdout) console.log(`[PrintService] stdout: ${stdout}`);
        if (stderr) console.log(`[PrintService] stderr: ${stderr}`);
        console.log('[PrintService] Wysłano do drukarki pomyślnie');
    } catch (error) {
        console.error('[PrintService] Błąd drukowania:', error);
        throw error;
    }
}

export async function getAvailablePrinters(): Promise<string[]> {
    try {
        const { stdout } = await execAsync('lpstat -p -d 2>/dev/null || echo ""');
        const printers: string[] = [];
        const lines = stdout.split('\n');
        for (const line of lines) {
            const match = line.match(/^printer\s+(\S+)/);
            if (match) {
                printers.push(match[1]);
            }
        }
        return printers;
    } catch {
        return [];
    }
}
