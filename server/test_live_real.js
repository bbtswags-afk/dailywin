import dotenv from 'dotenv';
dotenv.config();

const API_HOST = 'api-football-v1.p.rapidapi.com';
const BASE_URL = `https://${API_HOST}/v3`;

const getHeaders = () => ({
    'x-rapidapi-key': process.env.API_FOOTBALL_KEY,
    'x-rapidapi-host': API_HOST
});

const run = async () => {
    console.log("Checking for ANY live games...");
    try {
        const response = await fetch(`${BASE_URL}/fixtures?live=all`, { headers: getHeaders() });
        const data = await response.json();

        console.log(`Live Count: ${data.response ? data.response.length : 0}`);

        if (data.response && data.response.length > 0) {
            console.log("\n--- Active Matches ---");
            data.response.forEach(f => {
                const home = f.teams.home.name;
                const away = f.teams.away.name;
                if (home.includes('Cagliari') || away.includes('Cagliari')) {
                    console.log(`!!! FOUND TARGET MATCH !!!`);
                }
                console.log(`${f.league.name}: ${home} ${f.goals.home}-${f.goals.away} ${away} (${f.fixture.status.elapsed}')`);
            });
        }
    } catch (e) {
        console.error("Fetch Error:", e);
    }
};

run();
