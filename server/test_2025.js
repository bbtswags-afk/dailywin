import dotenv from 'dotenv';
dotenv.config();

const API_HOST = 'v3.football.api-sports.io';
const BASE_URL = `https://${API_HOST}`;

const getHeaders = () => ({
    'x-apisports-key': process.env.API_FOOTBALL_KEY,
    'x-rapidapi-host': API_HOST
});

const run = async () => {
    // Force check 2025
    const forcedDate = "2025-01-08";
    console.log(`Checking Date: ${forcedDate}`);

    try {
        const response = await fetch(`${BASE_URL}/fixtures?date=${forcedDate}`, { headers: getHeaders() });
        const data = await response.json();

        console.log(`Fixtures for 2025: ${data.response ? data.response.length : 0}`);
        if (data.response && data.response.length > 0) {
            console.log("Sample:", data.response[0].league.name, "-", data.response[0].teams.home.name);
        } else {
            console.log("No fixtures found for 2025 either. Raw:", JSON.stringify(data).substring(0, 200));
        }
    } catch (e) {
        console.error(e);
    }
};

run();
