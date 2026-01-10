import { generateDailyPredictions } from './src/utils/aiEngine.js';
import dotenv from 'dotenv';
dotenv.config();

const runDebug = async () => {
    console.log("🚀 Starting Debug Generation...");
    try {
        const results = await generateDailyPredictions();
        console.log("✅ Generation Complete.");
        console.log(`📊 Generated ${results.length} predictions.`);
        if (results.length === 0) {
            console.log("⚠️ WARNING: No predictions generated. Check strict league filters or API response.");
        } else {
            console.log("Sample:", results[0]);
        }
    } catch (error) {
        console.error("❌ Fatal Error:", error);
    }
};

runDebug();
