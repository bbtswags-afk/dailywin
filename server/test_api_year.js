import { getDailyFixtures } from './src/utils/footballApi.js';
import dotenv from 'dotenv';
dotenv.config();

// Manual override for testing
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
    const realYearDate = "2025-01-08"; // Assuming real world is 2025
    console.log("Checking Date:", realYearDate);

    const data = await fetchAPI(`/fixtures?date=${realYearDate}`);

    console.log(`Fixtures Found: ${data.response ? data.response.length : 0}`);
    if (data.response && data.response.length > 0) {
        console.log("First 3 Leagues:");
        data.response.slice(0, 3).forEach(f => console.log(`- ${f.league.name}: ${f.teams.home.name} vs ${f.teams.away.name}`));
    }
};

run();
