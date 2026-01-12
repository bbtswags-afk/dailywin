
import { generateDailyPredictions } from './src/utils/aiEngine.js';
import prisma from './src/utils/prisma.js';
import dotenv from 'dotenv';
dotenv.config();

const forceFix = async () => {
    console.log("🚑 FORCE FIX: Regenerating Failed Predictions...");

    // Hardcode Today's Date for Safety (Nigeria Time)
    const targetDate = "2026-01-12";
    const startOfDay = new Date("2026-01-12T00:00:00.000Z"); // Approximation for DB Query
    const endOfDay = new Date("2026-01-12T23:59:59.999Z");

    try {
        // 1. Delete ONLY the bad ones (or all for today to be clean)
        // Let's delete ALL for today to avoid duplicates/confusion
        const deleted = await prisma.prediction.deleteMany({
            where: {
                date: { gte: startOfDay, lte: endOfDay }
            }
        });
        console.log(`🧹 Deleted ${deleted.count} predictions for ${targetDate}.`);

        // 2. Regenerate
        console.log(`🔄 Generating fresh batch for ${targetDate}...`);
        const results = await generateDailyPredictions(targetDate);
        console.log(`✅ Success! Generated ${results.length} predictions.`);

    } catch (error) {
        console.error("❌ Fix Failed:", error);
    } finally {
        await prisma.$disconnect();
    }
};

forceFix();
