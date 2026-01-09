import dotenv from 'dotenv';
dotenv.config();

const API_HOST = 'api-football-v1.p.rapidapi.com';
const BASE_URL = `https://${API_HOST}/v3`;

const getHeaders = () => ({
    'x-rapidapi-key': process.env.API_FOOTBALL_KEY,
    'x-rapidapi-host': API_HOST
});

const run = async () => {
    console.log("Checking for ALL live games (No Filtering)...");
    try {
        const response = await fetch(`${BASE_URL}/fixtures?live=all`, { headers: getHeaders() });
        const data = await response.json();

        console.log(`Deep Check Status: ${response.status}`);
        console.log(`Total Live Matches Found: ${data.response ? data.response.length : 0}`);

        if (data.response && data.response.length > 0) {
            console.log("\n--- Full Match List ---");
            data.response.forEach(f => {
                console.log(`[${f.league.id}] ${f.league.name}: ${f.teams.home.name} vs ${f.teams.away.name} (${f.goals.home}-${f.goals.away})`);
            });
        } else {
            console.log("Response Dump:", JSON.stringify(data).substring(0, 500));
        }
    } catch (e) {
        console.error("Fetch Error:", e);
    }
};

run();
