import { getScrapedDailyFixtures } from './src/utils/footballApi.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const run = async () => {
    console.log("TESTING getScrapedDailyFixtures...");
    try {
        const data = await getScrapedDailyFixtures();
        console.log("Result:", data);
    } catch (e) {
        console.error("CRASH:", e);
    }
};

run();
