
import { getMatchContext, generatePrediction } from './src/utils/aiEngine.js';

const runSample = async () => {
    // Mock Fixture Object
    const mockGame = {
        teams: {
            home: { name: "Arsenal", logo: "..." },
            away: { name: "Tottenham Hotspur", logo: "..." }
        },
        league: { name: "Premier League", type: "League" },
        fixture: { id: 12345 }
    };

    console.log("🤖 Generating Sample Analysis for: Arsenal vs Tottenham Hotspur");
    console.log("   Fetching Real Data from TheSportsDB...");

    // 1. Get Context (Real Data)
    const context = await getMatchContext(mockGame, "2026-01-14");

    console.log("\n✅ Data Retrieved:");
    console.log("   - Home Form:", context.homeForm);
    console.log("   - Away Form:", context.awayForm);
    console.log("   - H2H Preview:", context.h2h.substring(0, 50) + "...");

    // 2. Generate Prediction (Real AI)
    console.log("\n🧠 Asking AI for Analysis...");
    const prediction = await generatePrediction(context, "Arsenal", "Tottenham Hotspur", "Premier League");

    console.log("\n================ DETAILED ANALYSIS =================\n");
    console.log(prediction.reasoning);
    console.log("\n====================================================");
    console.log(`Prediction: ${prediction.prediction}`);
    console.log(`Confidence: ${prediction.confidence}%`);
};

runSample();
