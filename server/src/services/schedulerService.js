import cron from 'node-cron';
import { generateDailyPredictions } from '../utils/aiEngine.js'; // Ensure correct path

export const initScheduler = () => {
    console.log("⏰ Scheduler Service Initialized.");

    // Run at 00:05 (12:05 AM) every day
    // "5 0 * * *" means: At minute 5, hour 0, every day
    cron.schedule('5 0 * * *', async () => {
        console.log("\n🌙 MIDNIGHT TASK: Starting Daily Prediction Generation...");
        console.log("-----------------------------------------------------");

        try {
            const predictions = await generateDailyPredictions();
            console.log(`\n✅ MIDNIGHT TASK COMPLETE: Generated ${predictions.length} predictions.`);
        } catch (error) {
            console.error("\n❌ MIDNIGHT TASK FAILED:", error);
        }
    }, {
        scheduled: true,
        timezone: "UTC" // Adjust if user wants specific TZ, but UTC/Server time is usually safest
    });

    console.log("   -> Daily Prediction Task scheduled for 12:05 AM UTC.");
};
