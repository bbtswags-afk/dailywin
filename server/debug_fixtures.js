import { getScrapedDailyFixtures } from './src/utils/footballApi.js';
import dotenv from 'dotenv';
dotenv.config();

const debugFixtures = async () => {
    console.log("🔍 Fetching Raw Fixtures...");
    try {
        const data = await getScrapedDailyFixtures();
        if (!data.response || data.response.length === 0) {
            console.log("❌ No fixtures returned from API.");
            return;
        }

        console.log(`✅ Found ${data.response.length} total fixtures.`);
        console.log("📋 Leagues found:");
        const leagues = new Set(data.response.map(f => f.league.name));
        leagues.forEach(l => console.log(`   - ${l}`));

    } catch (error) {
        console.error("❌ Error:", error);
    }
};

debugFixtures();
