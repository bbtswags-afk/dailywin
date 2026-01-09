import { getDailyFixtures } from './src/utils/footballApi.js';
import dotenv from 'dotenv';
dotenv.config();

console.log("Date Check:", new Date().toISOString().split('T')[0]);

const run = async () => {
    try {
        const data = await getDailyFixtures();
        console.log("RAW DATA:", JSON.stringify(data, null, 2));
        if (!data.response) {
            console.log("No response property.");
            return;
        }
        console.log(`Total Fixtures Found: ${data.response.length}`);

        const leagues = {};
        data.response.forEach(f => {
            const name = f.league.name;
            leagues[name] = (leagues[name] || 0) + 1;
        });
        console.log("Leagues Found:", leagues);

    } catch (e) {
        console.error(e);
    }
};

run();
