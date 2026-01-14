
import { generateDailyPredictions } from './src/utils/aiEngine.js';
import process from 'process';

const verify = async () => {
    // Force date to today/tomorrow (doesn't matter for TSDB check, but for getting fixtures)
    // Use the 2026 date user mentioned to prove it works
    const date = "2026-01-14";
    process.env.OVERRIDE_DATE = date;

    console.log(`🧪 Verifying Full Pipeline for ${date} using TSDB Source...`);

    // We expect generateDailyPredictions to:
    // 1. Fetch fixtures (LiveScore/API-Football)
    // 2. Call getMatchContext -> getForm_TSDB
    // 3. Log "✅ Form Acquired (TSDB)"

    try {
        await generateDailyPredictions(date);
    } catch (e) {
        console.error("Pipeline Failed:", e);
    }
};

verify();
