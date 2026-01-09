import dotenv from 'dotenv';
dotenv.config();

const API_HOST = 'api-football-v1.p.rapidapi.com';
const BASE_URL = `https://${API_HOST}/v3`;

const getHeaders = () => ({
    'x-rapidapi-key': process.env.API_FOOTBALL_KEY,
    'x-rapidapi-host': API_HOST
});

const run = async () => {
    const today = new Date().toISOString().split('T')[0]; // Uses system 2026-01-08
    console.log(`Checking API for Today: ${today}`);

    try {
        const response = await fetch(`${BASE_URL}/fixtures?date=${today}`, { headers: getHeaders() });
        const data = await response.json();

        console.log(`Fixtures Found: ${data.response ? data.response.length : 0}`);
        if (data.errors && Object.keys(data.errors).length > 0) {
            console.log("Errors:", JSON.stringify(data.errors));
        } else if (data.response && data.response.length > 0) {
            const f = data.response[0];
            console.log(`Sample: ${f.league.name} - ${f.teams.home.name} vs ${f.teams.away.name}`);
        }
    } catch (e) {
        console.error("Fetch Error:", e);
    }
};

run();
