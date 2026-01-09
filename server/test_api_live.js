import dotenv from 'dotenv';
dotenv.config();

const fetchAPI = async (endpoint) => {
    const API_KEY = process.env.API_FOOTBALL_KEY;
    const API_HOST = 'v3.football.api-sports.io';
    const headers = { 'x-apisports-key': API_KEY, 'x-rapidapi-host': API_HOST };
    const BASE_URL = `https://${API_HOST}`;

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, { headers });
        return await response.json();
    } catch (e) {
        return { response: [] };
    }
};

const run = async () => {
    console.log("Checking LIVE fixtures...");
    const data = await fetchAPI(`/fixtures?live=all`);

    console.log(`Live Fixtures Found: ${data.response ? data.response.length : 0}`);
    if (data.response && data.response.length > 0) {
        data.response.forEach(f => {
            console.log(`[LIVE] ${f.league.name}: ${f.teams.home.name} ${f.goals.home}-${f.goals.away} ${f.teams.away.name} (${f.fixture.status.elapsed}')`);
        });
    }
};

run();
