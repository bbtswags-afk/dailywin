import { generateDailyPredictions } from './src/utils/aiEngine.js';
import { getScrapedDailyFixtures } from './src/utils/footballApi.js';
import { getTrueDate } from './src/utils/timeService.js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const run = async () => {
    console.log("🚀 STARTING LOCAL DEBUG GENERATION");

    // 1. Check Date
    const today = await getTrueDate();
    console.log(`📅 Date: ${today.toISOString()}`);

    // 2. Clear DB
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const deleted = await prisma.prediction.deleteMany({
        where: {
            date: {
                gte: startOfDay,
                lte: endOfDay
            }
        }
    });
    console.log(`🗑️ Cleared ${deleted.count} existing predictions.`);

    // 3. Test Scraper
    console.log("🕷️ Fetching Fixtures...");
    const data = await getScrapedDailyFixtures();
    const fixtures = data.response || [];
    console.log(`✅ Scraper Found: ${fixtures.length} raw fixtures.`);

    if (fixtures.length > 0) {
        console.log(`   Sample: ${fixtures[0].teams.home.name} vs ${fixtures[0].teams.away.name} (${fixtures[0].league.name})`);
    } else {
        console.log("❌ SCRAPER RETURNED ZERO GAMES. Check footballApi.js logic!");
    }

    // 4. Force Generation
    console.log("🧠 Triggering AI Generation...");
    try {
        const preds = await generateDailyPredictions();
        console.log(`🏁 Generation Complete. Created ${preds.length} predictions.`);
        preds.forEach(p => console.log(`   - ${p.homeTeam} vs ${p.awayTeam}: ${p.prediction}`));
    } catch (e) {
        console.error("❌ GENERATION FAILED:", e);
    }
};

run();
