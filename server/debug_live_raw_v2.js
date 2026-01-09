import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const API_HOST = 'api-football-v1.p.rapidapi.com';
const BASE_URL = `https://${API_HOST}/v3`;

// Key Rotation Logic
const distinctKeys = (process.env.API_FOOTBALL_KEY || '').split(',').map(k => k.trim()).filter(k => k);

const getHeaders = (key) => ({
    'x-rapidapi-key': key,
    'x-rapidapi-host': API_HOST
});

const run = async () => {
    console.log(`Loaded ${distinctKeys.length} Keys.`);

    for (const key of distinctKeys) {
        if (!key) continue;
        console.log(`Trying Key: ${key.substring(0, 10)}...`);

        try {
            const response = await fetch(`${BASE_URL}/fixtures?live=all`, { headers: getHeaders(key) });

            // Check HTTP Status
            if (response.status !== 200) {
                console.log(`Key Failed: ${response.status}`);
                continue;
            }

            const data = await response.json();

            // Check Logical Errors
            if (data.errors && (Array.isArray(data.errors) ? data.errors.length > 0 : Object.keys(data.errors).length > 0)) {
                console.log("Key Logical Error:", JSON.stringify(data.errors));
                continue;
            }

            // Success
            console.log(`SUCCESS! Found ${data.response.length} live games.`);
            data.response.forEach(m => {
                console.log(`[${m.league.id}] ${m.league.name} (${m.league.country}): ${m.teams.home.name} vs ${m.teams.away.name} (${m.goals.home}-${m.goals.away})`);
            });
            return; // Exit after success

        } catch (e) {
            console.error("Fetch Error:", e.message);
        }
    }
    console.log("All keys failed.");
};

run();
