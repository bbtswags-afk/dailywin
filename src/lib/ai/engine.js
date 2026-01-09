import { GoogleGenerativeAI } from "@google/generative-ai";
import { getDailyFixtures, getFixtureLineups, getHeadToHead, getLeagueStandings } from "../api/football";

// Initialize Gemini
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

const getMatchContext = async (game) => {
    const homeId = game.teams.home.id;
    const awayId = game.teams.away.id;
    const leagueId = game.league.id;
    const season = game.league.season;

    // 1. Fetch Head-to-Head (Last 5 Games)
    let h2hStrings = "No recent H2H data.";
    try {
        const h2hData = await getHeadToHead(homeId, awayId);
        if (h2hData.response && h2hData.response.length > 0) {
            h2hStrings = h2hData.response.map(m =>
                `${m.teams.home.name} ${m.goals.home}-${m.goals.away} ${m.teams.away.name} (${new Date(m.fixture.date).toLocaleDateString()})`
            ).slice(0, 5).join('; ');
        }
    } catch (e) {
        console.warn("H2H fetch failed", e);
    }

    // 2. Fetch Standings (for Form: "WWLDL")
    let homeForm = "Unknown (Check recent results manually)";
    let awayForm = "Unknown (Check recent results manually)";

    if ([39, 140, 135, 78, 61].includes(leagueId)) {
        try {
            const standingsData = await getLeagueStandings(leagueId, season);
            const table = standingsData.response?.[0]?.league?.standings?.[0];
            if (table) {
                const homeEntry = table.find(t => t.team.id === homeId);
                const awayEntry = table.find(t => t.team.id === awayId);
                if (homeEntry) homeForm = homeEntry.form || "N/A";
                if (awayEntry) awayForm = awayEntry.form || "N/A";
            }
        } catch (e) { console.warn("Form fetch failed", e); }
    }

    // 3. Lineup Check (Smart Lock)
    let lineups = "Lineups not officially confirmed yet (Predict provisional).";
    const timeToKickoff = new Date(game.fixture.date).getTime() - Date.now();
    const oneHour = 60 * 60 * 1000;

    if (timeToKickoff < oneHour && timeToKickoff > -oneHour * 2) {
        try {
            const lineupsData = await getFixtureLineups(game.fixture.id);
            if (lineupsData.response && lineupsData.response.length === 2) {
                const homeXI = lineupsData.response[0].startXI.map(p => p.player.name).join(', ');
                const awayXI = lineupsData.response[1].startXI.map(p => p.player.name).join(', ');
                lineups = `CONFIRMED STARTING XI: Home: [${homeXI}] vs Away: [${awayXI}]`;
            }
        } catch (e) {
            console.warn("Lineup fetch failed", e);
        }
    }

    // 4. Motivation & Volatility Context (Manipulation Radar)
    const isCup = game.league.type === 'Cup';
    const volatilityContext = isCup
        ? "This is a Cup Match. Motivation is variable. High Risk."
        : "Regular Season. Check for End-of-Season lack of motivation if date is late."

    return { h2h: h2hStrings, homeForm, awayForm, lineups, volatilityContext };
};

export const generatePrediction = async (homeTeam, awayTeam, league, context) => {
    try {
        const prompt = `
        Act as a Professional Football Analyst.
        Match: ${homeTeam} vs ${awayTeam} (${league}).
        
        DATA:
        1. Form (Last 5 Games): Home (${context.homeForm}), Away (${context.awayForm}).
        2. Head-to-Head History: ${context.h2h}.
        3. Tactical Info: ${context.lineups}.
        4. Context: ${context.volatilityContext}.

        ALLOWED PREDICTIONS (Pick the safest ONE):
        - "Over 1.5 Goals"
        - "Over 2.5 Goals"
        - "Double Chance 1X" (Home or Draw)
        - "Double Chance X2" (Away or Draw)
        - "Home Win"
        - "Away Win"
        - "Over 5.5 Corners"

        TASK:
        Analyze the data. Prioritize SAFETY and ACCURACY. High confidence requires Lineup confirmation or strong Form.
        
        Provide a JSON response:
        - prediction: One of the Allowed Predictions strings.
        - confidence: 0-100.
        - reasoning: 2 sentences explaining why.
        - type: "Safe" (90%+), "Value" (75-89%), or "Risky" (<75%).
        - isVolatile: boolean.
        - volatilityReason: String (if volatile).
        - odds: String (Estimate decimal odds e.g. "1.50").

        Return ONLY valid JSON. Do not use markdown blocks.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Robust JSON Extraction
        text = text.replace(/```json/g, '').replace(/```/g, '');
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            text = text.substring(firstBrace, lastBrace + 1);
        }

        return JSON.parse(text);

    } catch (error) {
        console.error("Gemini AI Analysis Error:", error);

        // Local Fallback if AI fails (Basic Stats Logic)
        const fallbackPrediction = getLocalPrediction(context);

        return {
            prediction: fallbackPrediction.prediction,
            confidence: 45, // Low confidence
            reasoning: `AI Service Busy. Prediction based on raw stats: ${fallbackPrediction.reasoning}`,
            type: "Risky",
            isVolatile: true,
            isVolatile: true,
            volatilityReason: `AI Error: ${error.message || "Connection Failed"}`,
            odds: "N/A"
        };
    }
};

// Simple Stats-Based Fallback (Offline Mode)
const getLocalPrediction = (context) => {
    // Very basic logic to avoid "Analysis Failed"
    if (context.homeForm.includes('W') && !context.awayForm.includes('W')) return { prediction: "Home Win", reasoning: "Stronger recent form." };
    if (context.awayForm.includes('W') && !context.homeForm.includes('W')) return { prediction: "Away Win", reasoning: "Stronger recent form." };
    return { prediction: "Double Chance 1X", reasoning: "Balanced stats, likely draw or home win." };
};

export const generateDailyPredictions = async () => {
    try {
        const data = await getDailyFixtures();
        const fixtures = data.response;

        if (!fixtures || fixtures.length === 0) return [];

        const topFixtures = fixtures.filter(f =>
            [39, 140, 135, 78, 61].includes(f.league.id) &&
            !['FT', 'AET', 'PEN'].includes(f.fixture.status.short) // Exclude Finished Games
        ).slice(0, 3);

        if (topFixtures.length === 0) return [];

        const gamesToPredict = topFixtures;

        const predictions = await Promise.all(gamesToPredict.map(async (game) => {
            const context = await getMatchContext(game);

            const aiResult = await generatePrediction(
                game.teams.home.name,
                game.teams.away.name,
                game.league.name,
                context
            );

            return {
                id: game.fixture.id,
                homeTeam: game.teams.home.name,
                awayTeam: game.teams.away.name,
                homeLogo: game.teams.home.logo,
                awayLogo: game.teams.away.logo,
                league: game.league.name,
                time: new Date(game.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                h2h: context.h2h,
                form: { home: context.homeForm.split(''), away: context.awayForm.split('') },
                manipulationCheck: !aiResult.isVolatile, // Safe if NOT volatile (true = SAFE)
                volatilityReason: aiResult.volatilityReason,
                ...aiResult
            };
        }));

        return predictions;

    } catch (error) {
        console.error("Prediction Engine Error:", error);
        return [];
    }
};
