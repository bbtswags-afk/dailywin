import prisma from './src/utils/prisma.js';
import { getTrueDate } from './src/utils/timeService.js';

const clearTodaysPredictions = async () => {
    try {
        console.log("🧹 Starting cleanup of pending predictions...");

        // 1. Get Today's Date (or Override)
        const dateStr = process.env.OVERRIDE_DATE;
        let today;
        if (dateStr) {
            today = new Date(dateStr);
        } else {
            today = await getTrueDate();
        }

        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        console.log(`   Target Date: ${startOfDay.toISOString().split('T')[0]}`);

        // 2. Delete Pending Predictions for Today
        const { count } = await prisma.prediction.deleteMany({
            where: {
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                result: 'PENDING'
            }
        });

        console.log(`✅ Successfully deleted ${count} pending predictions.`);
        console.log("   Restart the server or trigger the generation endpoint to create new, safer predictions!");

    } catch (error) {
        console.error("❌ Error clearing predictions:", error);
    } finally {
        await prisma.$disconnect();
    }
};

clearTodaysPredictions();
