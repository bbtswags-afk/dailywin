import { getDailyFixtures } from './src/utils/footballApi.js';

// Mock process.env if needed, or rely on .env loading if I run with --env-file or similar, 
// but easier to just check if the file imports correctly. 
// Actually, footballApi.js uses process.env.API_FOOTBALL_KEY.
// I need to load dotenv.

import dotenv from 'dotenv';
dotenv.config();

console.log("Testing API Fetch...");
const run = async () => {
    try {
        const data = await getDailyFixtures();
        console.log("Status:", data.response ? "OK" : "NO RESPONSE");
        console.log("Count:", data.response ? data.response.length : 0);
        if (data.response && data.response.length > 0) {
            console.log("First match league:", data.response[0].league.name);
        }
    } catch (e) {
        console.error("Error:", e);
    }
};

run();
