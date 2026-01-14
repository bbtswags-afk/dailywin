import puppeteer from 'puppeteer';
import { getScrapedDailyFixtures } from './src/utils/footballApi.js';

const testDate = async () => {
    const targetDate = "2026-01-14";
    console.log(`🔎 TESTING SCRAPER for: ${targetDate}`);

    // Mock the env for date override
    process.env.OVERRIDE_DATE = targetDate;

    const fixtures = await getScrapedDailyFixtures(targetDate);
    if (!fixtures.response || fixtures.response.length === 0) {
        console.error("❌ No fixtures found in API for this date.");
        return;
    }

    const game = fixtures.response[0]; // Wolfsburg vs ...
    const homeName = game.teams.home.name;
    const awayName = game.teams.away.name;

    console.log(`🎯 Target Match: ${homeName} vs ${awayName}`);

    // --- INSTRUMENTED SCRAPER LOGIC ---
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    const page = await browser.newPage();

    const listUrl = `https://fbref.com/en/matches/${targetDate}`;
    console.log(`🌐 Visiting: ${listUrl}`);

    await page.goto(listUrl, { waitUntil: 'domcontentloaded' });

    // Check if table exists
    const tables = await page.$$('table.stats_table');
    console.log(`📊 Tables found: ${tables.length}`);

    if (tables.length > 0) {
        // Dump first few rows text
        const rows = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('table.stats_table tbody tr'))
                .slice(0, 10)
                .map(r => r.innerText.replace(/\t/g, ' | '));
        });
        console.log("📄 First 10 Rows of Table:");
        console.log(rows.join('\n'));
    } else {
        const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
        console.log("❌ NO TABLE FOUND. Body Text preview:");
        console.log(bodyText);
    }

    await browser.close();
};

testDate();
