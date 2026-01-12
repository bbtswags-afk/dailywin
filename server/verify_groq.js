
import { generatePrediction } from './src/utils/aiEngine.js';
import dotenv from 'dotenv';
dotenv.config();

const testContext = {
    h2h: "Home won 2, Away won 1, Draw 2",
    homeForm: "WWLDW",
    awayForm: "LLLDD",
    volatilityContext: "Regular Match",
    homeStats: { scored: '5', conceded: '2' },
    awayStats: { scored: '1', conceded: '5' }
};

console.log("🚀 Testing AI Connection...");

try {
    const result = await generatePrediction(testContext, "TestHome", "TestAway", "TestLeague");
    console.log("✅ Result:", result);
} catch (e) {
    console.error("❌ Fatal Error:", e);
}
