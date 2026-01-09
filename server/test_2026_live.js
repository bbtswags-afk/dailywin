import dotenv from 'dotenv';
dotenv.config();

const API_HOST = 'api-football-v1.p.rapidapi.com';
const BASE_URL = `https://${API_HOST}/v3`;

const getHeaders = () => ({
    'x-rapidapi-key': process.env.API_FOOTBALL_KEY,
    'x-rapidapi-host': API_HOST
});

const run = async () => {
    console.log("Checking LIVE (RapidAPI)...");

    try {
        const response = await fetch(`${BASE_URL}/fixtures?live=all`, { headers: getHeaders() });
        const data = await response.json();

        console.log(`Live Fixtures Found: ${data.response ? data.response.length : 0}`);
        if (data.response && data.response.length > 0) {
            data.response.forEach(f => {
                console.log(`[LIVE] ${f.league.name}: ${f.teams.home.name} ${f.goals.home}-${f.goals.away} ${f.teams.away.name}`);
            });
        }
    } catch (e) {
        console.error("Fetch Error:", e);
    }
};

run();
