import { generateDailyPredictions } from './src/utils/aiEngine.js';
import prisma from './src/utils/prisma.js';
import { getTrueDate } from './src/utils/timeService.js';
import dotenv from 'dotenv';
dotenv.config();

const regenerate = async () => {
    console.log("🔄 Regenerating Predictions with Expanded Leagues...");
    try {
        // 1. Clear Pending (Copy of previous logic)
        const dateStr = process.env.OVERRIDE_DATE;
        let today = dateStr ? new Date(dateStr) : await getTrueDate();
        const startOfDay = new Date(today); startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today); endOfDay.setHours(23, 59, 59, 999);

        await prisma.prediction.deleteMany({
            where: {
                date: { gte: startOfDay, lte: endOfDay },
                result: 'PENDING'
            }
        });
        console.log("broom Cleared old/empty predictions.");

        // 2. Generate New
        const results = await generateDailyPredictions();
        console.log(`✅ Generated ${results.length} new predictions.`);

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await prisma.$disconnect();
    }
};

regenerate();
