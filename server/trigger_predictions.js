
import { generateDailyPredictions } from './src/utils/aiEngine.js';
import prisma from './src/utils/prisma.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

console.log("🚀 Manually Triggering Prediction Engine (Scraper Mode)...");

// Custom Logger to capture output
const logStream = fs.createWriteStream('debug_log.txt', { flags: 'w' });
const originalLog = console.log;
const originalError = console.error;

function formatError(error) {
    if (error instanceof Error) {
        return `${error.name}: ${error.message}\n${error.stack}`;
    }
    return JSON.stringify(error, null, 2);
}

function logToFile(...args) {
    const msg = args.map(arg =>
        arg instanceof Error ? formatError(arg) :
            (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))
    ).join(' ');

    logStream.write(msg + '\n');
    originalLog.apply(console, args);
}

console.log = logToFile;
console.error = logToFile;

const run = async () => {
    try {
        // Force Clear for Debugging/Regeneration
        await prisma.prediction.deleteMany({
            where: {
                result: 'PENDING',
                // Optional: Only clear today's if needed, but for now clear all pending to be safe
            }
        });
        console.log("🧹 FORCE CLEARED PENDING PREDICTIONS.");

        const preds = await generateDailyPredictions();
        console.log(`✅ Generated/Found ${preds.length} Predictions.`);
        preds.forEach(p => {
            console.log(`[${p.league}] ${p.homeTeam} vs ${p.awayTeam} -> ${p.prediction} (${p.category})`);
        });
    } catch (error) {
        console.error("Prediction Logic Error:", error);
    }
};

run();
