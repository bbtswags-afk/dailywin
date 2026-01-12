
import { getFormFromScraper } from './src/utils/scraperService.js';

// Test Case: A specific match from the past where we know the teams
// Date: 2024-05-19 (Premier League Final Day 2023/24)
// Match: Arsenal vs Everton

const testScraperDate = async () => {
    console.log("🧪 Testing Scraper Date Logic...");
    const dateStr = "2024-05-19";
    const home = "Arsenal";
    const away = "Everton";

    console.log(`🔎 Requesting Form for ${home} vs ${away} on ${dateStr}...`);

    // This should visit https://fbref.com/en/matches/2024-05-19
    const result = await getFormFromScraper(home, away, dateStr);

    console.log("✅ Result:", result);

    if (result.homeForm !== "N/A") {
        console.log("🎉 SUCCESS: Form data retrieved using specific date!");
    } else {
        console.log("❌ FAILURE: Form data N/A. Check logs.");
    }
};

testScraperDate();
