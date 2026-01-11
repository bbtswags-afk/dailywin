import cron from 'node-cron';
import { generateDailyPredictions } from '../utils/aiEngine.js'; // Ensure correct path

export const initScheduler = () => {
    console.log("⏰ Scheduler Service Initialized (Africa/Lagos).");

    // Run at 01:00 (1:00 AM) every day Lagos Time
    cron.schedule('0 1 * * *', async () => {
        console.log("\n🌙 1:00 AM TASK: Starting Daily Prediction Generation for Nigeria...");
        console.log("-----------------------------------------------------");

        try {
            // Get Current Date in Nigeria
            const now = new Date();
            const formatter = new Intl.DateTimeFormat('en-CA', {
                timeZone: 'Africa/Lagos',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
            const nigeriaDate = formatter.format(now); // "YYYY-MM-DD"
            console.log(`   -> Target Date (Nigeria): ${nigeriaDate}`);

            const predictions = await generateDailyPredictions(nigeriaDate);
            console.log(`\n✅ TASK COMPLETE: Generated ${predictions.length} predictions for ${nigeriaDate}.`);
        } catch (error) {
            console.error("\n❌ TASK FAILED:", error);
        }
    }, {
        scheduled: true,
        timezone: "Africa/Lagos"
    });

    console.log("   -> Daily Prediction Task scheduled for 1:00 AM Lagos Time.");
};
