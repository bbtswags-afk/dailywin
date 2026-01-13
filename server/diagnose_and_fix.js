
import { generateDailyPredictions } from './src/utils/aiEngine.js';
import prisma from './src/utils/prisma.js';

const diagnoseAndFix = async () => {
    console.log("🚑 DIAGNOSIS & FIX STARTED");

    // 1. Force Date to Today
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Target Date: ${today}`);

    // 2. Clear Existing (Bad) Predictions for Today
    console.log("🧹 Clearing bad predictions...");
    const start = new Date(today); start.setHours(0, 0, 0, 0);
    const end = new Date(today); end.setHours(23, 59, 59, 999);

    await prisma.prediction.deleteMany({
        where: { date: { gte: start, lte: end } }
    });

    // 3. Run Generation with verbose logging (The engine logs to console)
    console.log("🔄 Regenerating...");
    try {
        const results = await generateDailyPredictions(today);
        console.log("✅ FINISHED. Results:", results.length);

        // Sample check
        if (results.length > 0) {
            console.log("First Prediction Reasoning:", results[0].reasoning);
            console.log("First Prediction Form:", results[0].form);
        }
    } catch (e) {
        console.error("❌ CRTICAL ERROR:", e);
    }
};

diagnoseAndFix();
