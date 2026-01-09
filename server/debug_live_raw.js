import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const API_HOST = 'api-football-v1.p.rapidapi.com';
const BASE_URL = `https://${API_HOST}/v3`;

// Key Rotation Logic
const distinctKeys = (process.env.API_FOOTBALL_KEY || '').split(',').map(k => k.trim()).filter(k => k);

const getHeaders = () => ({
    'x-rapidapi-key': distinctKeys[0],
    'x-rapidapi-host': API_HOST
});

console.log("Using Key:", distinctKeys[0] ? distinctKeys[0].substring(0, 10) + '...' : 'NONE');

const run = async () => {
    try {
        console.log("Fetching ALL Live Games...");
        const response = await fetch(`${BASE_URL}/fixtures?live=all`, { headers: getHeaders() });
        const data = await response.json();

        if (!data.response) {
            console.log("Error/Empty:", data);
            return;
        }

        console.log(`Found ${data.response.length} live games.`);

        data.response.forEach(m => {
            console.log(`[${m.league.id}] ${m.league.name} (${m.league.country}): ${m.teams.home.name} vs ${m.teams.away.name} (${m.goals.home}-${m.goals.away})`);
        });

    } catch (e) {
        console.error("Fetch Error:", e);
    }
};

run();
