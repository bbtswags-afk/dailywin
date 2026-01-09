import dotenv from 'dotenv';
dotenv.config();

const API_HOST = 'api-football-v1.p.rapidapi.com';
const BASE_URL = `https://${API_HOST}/v3`;

const getHeaders = () => ({
    'x-rapidapi-key': process.env.API_FOOTBALL_KEY,
    'x-rapidapi-host': API_HOST
});

const run = async () => {
    // Force check 2025-01-08 with VALID headers
    const testDate = "2025-01-08";
    console.log(`Checking API for: ${testDate}`);

    try {
        const response = await fetch(`${BASE_URL}/fixtures?date=${testDate}`, { headers: getHeaders() });
        const data = await response.json();

        console.log(`Fixtures Found: ${data.response ? data.response.length : 0}`);
        if (data.response && data.response.length > 0) {
            console.log("Sample:", data.response[0].league.name, "-", data.response[0].teams.home.name);
        }
    } catch (e) {
        console.error("Fetch Error:", e);
    }
};

run();
