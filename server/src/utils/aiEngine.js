import Groq from "groq-sdk";
import { getScrapedDailyFixtures, getFixtureLineups, getHeadToHead, getLeagueStandings, searchTeam } from "./footballApi.js";
import prisma from "./prisma.js";
import { getSimulatedAnalysis } from './statsSimulator.js';
import { getH2HFree } from './freeFootballApi.js';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const getMatchContext = async (game) => {
    const homeTeamName = game.teams.home.name;
    const awayTeamName = game.teams.away.name;

    // 1. DEFAULT: Simulator (Fallback)
    // We generate this first in case API fails
    const simStats = getSimulatedAnalysis(homeTeamName, awayTeamName);
    let strategy = {
        market: simStats.suggestedMarket,
        txt: simStats.suggestedReasoning,
        style: simStats.homeStyle
    };
    let h2hStrings = simStats.h2h + " (Simulated)";
    let homeForm = simStats.homeForm + " (Simulated)";
    let awayForm = simStats.awayForm + " (Simulated)";

    // 2. REAL API DATA ATTEMPT (Via Football-Data.org Free Tier)
    let freeData = null;
    try {
        console.log(`🔎 Searching Free API for Real Data: ${homeTeamName} vs ${awayTeamName}`);
        freeData = await getH2HFree(homeTeamName, awayTeamName, game.league.name);

        if (freeData) {
            h2hStrings = freeData.h2h || h2hStrings;
            homeForm = freeData.homeForm || homeForm;
            awayForm = freeData.awayForm || awayForm;

            // If we got real data, append (Real) label
            h2hStrings += " (Real)";
            homeForm += " (Real)";
            awayForm += " (Real)";

            console.log("   -> ✅ Real H2H/Form Data Acquired via Football-Data.org.");
        } else {
            console.log("   -> Match not found in Free API (Likely league coverage limit). Using Simulator.");
        }

    } catch (e) {
        console.error("   -> Real Data Fetch Failed (Using Simulator):", e.message);
    }

    const homeStats = freeData?.homeStats || null;
    const awayStats = freeData?.awayStats || null;

    const isCup = game.league.type === 'Cup';
    const volatilityContext = isCup ? "Cup Match. High Risk." : "Regular Season.";

    return { h2h: h2hStrings, homeForm, awayForm, strategy, volatilityContext, homeStats, awayStats };
};

const generatePrediction = async (homeTeam, awayTeam, league, context) => {
    try {
        if (!GROQ_API_KEY) throw new Error("No Groq Key");

        const groq = new Groq({ apiKey: GROQ_API_KEY });

        const hStats = context.homeStats || { scored: '?', conceded: '?' };
        const aStats = context.awayStats || { scored: '?', conceded: '?' };

        const prompt = `
        Act as an AI Sports Betting Syndicate composed of two analysts:
        1. "The Scout" (Aggressive): Focuses on Home Form, Goals Scored, and H2H Dominance. Wants to find the winner.
        2. "The Accountant" (Conservative): Focuses on Away Form resilience, Goals Conceded, and "Trap Games". Wants to avoid losing money.

        Match: ${homeTeam} vs ${awayTeam} (${league}).
        
        Data (Last 5 Games):
        - Home Form: ${context.homeForm}
        - Home Goals: Scored ${hStats.scored}, Conceded ${hStats.conceded}
        - Away Form: ${context.awayForm}
        - Away Goals: Scored ${aStats.scored}, Conceded ${aStats.conceded}
        - H2H: ${context.h2h}
        Context: ${context.volatilityContext}.

        Task: Run a debate between The Scout and The Accountant.
        - You MUST prioritize SAVETY over high odds. 
        - Avoid "Over 2.5 Goals" unless it is 99% certain (e.g. Manchester City vs 4th tier team), otherwise prefer "Over 1.5 Goals".
        - If "Home Win" is risky, use "Double Chance 1X" or "Over 0.5 Goals" for the home team.

        Allowed Markets (Prioritized by Safety): 
        - "Over 1.5 Goals" (Very Safe - Standard)
        - "Over 0.5 Goals" (Ultra Safe)
        - "Double Chance 1X" (Home Win or Draw - Safe)
        - "Double Chance X2" (Away Win or Draw - Safe)
        - "Double Chance 12" (Any Winner - Safe)
        - "Home Win" (Only if clear favorite)
        - "Away Win" (Only if clear favorite)
        - "Over 5.5 Corners" (Safe)
        - "Over 7.5 Corners" (Moderate)
        - "Home Team Over 0.5 Goals" (Safe)
        - "Away Team Over 0.5 Goals" (Safe)
        - "Under 4.5 Goals" (Safe for defensive games)

        Output JSON ONLY:
        {
            "prediction": "The Consensus Market",
            "confidence": 0-100,
            "reasoning": "Briefly summarize the debate (e.g. 'Scout liked Home Win, but Accountant feared the defense, so we settled on Over 1.5').",
            "type": "Safe" | "Risky" | "Value",
            "isVolatile": boolean,
            "odds": "Decimal Odds (e.g. 1.30, 1.50)"
        }
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
        });

        let text = completion.choices[0]?.message?.content || "";

        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            text = text.substring(firstBrace, lastBrace + 1);
        }

        return JSON.parse(text);

    } catch (error) {
        console.error("AI Error (Groq):", error);

        // SMART FALLBACK (Rule-Based AI) when API fails
        // Use the Goal Stats to generate a smart prediction
        let market = "Double Chance 1X";
        let reasoning = "Balanced match favoring home.";
        let type = "Safe";
        let odds = "1.50";

        const hScored = context.homeStats?.scored || 0;
        const hConceded = context.homeStats?.conceded || 0;
        const aScored = context.awayStats?.scored || 0;
        const aConceded = context.awayStats?.conceded || 0;

        const totalGoals = hScored + hConceded + aScored + aConceded;
        const homeFormScore = (context.homeForm.match(/W/g) || []).length * 3 + (context.homeForm.match(/D/g) || []).length;
        const awayFormScore = (context.awayForm.match(/W/g) || []).length * 3 + (context.awayForm.match(/D/g) || []).length;

        if (totalGoals >= 25) { // Avg 2.5 goals per game across both teams
            market = "Over 1.5 Goals"; // CHANGED from 2.5 for Safety
            reasoning = `High scoring teams (${hScored}+${aScored} goals recently). Safe bet on goals.`;
            type = "Safe";
            odds = "1.30";
        } else if (homeFormScore >= 10 && awayFormScore < 5) { // Home dominant
            market = "Home Win";
            reasoning = `Home team in strong form (${context.homeForm}) vs struggling away side.`;
            type = "Safe";
            odds = "1.70";
        } else if (awayFormScore >= 10 && homeFormScore < 5) { // Away dominant
            market = "Double Chance X2";
            reasoning = `Away team is outperforming hosts (${context.awayForm}).`;
            type = "Risky";
            odds = "1.90";
        } else if (totalGoals <= 12) { // Defensive
            market = "Under 3.5 Goals";
            reasoning = "Defensive styles detected. Tight game expected.";
            type = "Safe";
            odds = "1.40";
        }

        return {
            prediction: market,
            odds: odds,
            confidence: 75,
            analysis: `H2H: ${context.h2h}. Form: Home ${context.homeForm.slice(0, 5)}, Away ${context.awayForm.slice(0, 5)}. Style: ${context.strategy?.style || 'Balanced'}.`,
            reasoning: reasoning,
            type: type,
            isVolatile: true
        };
    }
};

import { getTrueDate } from "./timeService.js";

// ...

export const generateDailyPredictions = async () => {
    try {
        // Time Travel Logic / Online Time
        const dateStr = process.env.OVERRIDE_DATE;

        let today;
        if (dateStr) {
            today = new Date(dateStr);
        } else {
            today = await getTrueDate();
        }

        console.log(`🤖 AI Engine Processing for: ${today.toISOString().split('T')[0]}`);

        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        // CLEANUP: Remove old/stale predictions to ensure "Real Data Only"
        // This fixes the issue where test data from 2025 appears in 2026 views
        /* 
           Actually, deleting *everything* not today might be too aggressive if we want history.
           But for "Live Dashboard", we only want Today.
           User complained about "Wrong Game". 
           safest: Delete 'PENDING' predictions that are NOT today.
        */
        await prisma.prediction.deleteMany({
            where: {
                date: {
                    not: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                },
                result: 'PENDING' // Only delete pending, keep History
            }
        });
        console.log("🧹 Cleared stale pending predictions.");

        // 1. Check DB for existing predictions for today
        const existingPredictions = await prisma.prediction.findMany({
            where: {
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        });

        if (existingPredictions.length >= 6) { // Ensure we have at least 6
            console.log(`Found ${existingPredictions.length} predictions in DB.`);
            return existingPredictions.map(p => ({
                id: p.id,
                homeTeam: p.homeTeam,
                awayTeam: p.awayTeam,
                league: p.league,
                prediction: p.prediction,
                confidence: p.confidence,
                reasoning: p.reasoning,
                analysis: p.analysis,
                odds: p.odds,
                type: p.type,
                isVolatile: p.isVolatile,
                time: p.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                category: p.category
            }));
        }

        // 2. Fetch Real Fixtures from API
        console.log("Fetching new fixtures from API...");
        const data = await getScrapedDailyFixtures();

        if (!data.response || data.response.length === 0) {
            console.log("No fixtures found today (possibly 2026 or off-season). Proceeding to Mock Data...");
            // Do NOT return empty here. Let it fall through to the mock generator at the bottom.
            // return []; 
        }

        // 3. Strict League Filtering (User Request: "Only predict games in these leagues")
        // Based on user image:
        const STRICT_LEAGUES = [
            'Champions League',
            'Premier League',
            'LaLiga', 'La Liga', 'Primera Division',
            'Bundesliga',
            'Serie A', // Covers Italy and Brazil (usually "Serie A" or "Serie A Betano")
            'Ligue 1',
            'Eredivisie',
            'Primeira Liga', 'Liga Portugal',
            'Championship', // England
            'World Cup',
            'Euro 2024', 'European Championship'
        ];

        // Explicitly exclude lower tiers that mimic upper tier names
        const EXCLUDED_KEYWORDS = [
            'U21', 'U19', 'U18', 'Women', 'Reserve',
            'Premier League 2', 'Liga 2', 'Ligue 2', 'Bundesliga 2', 'Serie B',
            'Segunda', 'Youth', 'Cup'
        ];

        let selectedFixtures = data.response.filter(f => {
            const leagueName = f.league.name;
            const leagueId = f.league.id;

            // 1. Check Exclusions FIRST (Robust)
            const isExcluded = EXCLUDED_KEYWORDS.some(bad => leagueName.includes(bad));
            if (isExcluded) return false;

            // 2. Check Whitelist
            const match = STRICT_LEAGUES.some(keyword => leagueName.includes(keyword));

            return match;
        });

        console.log(`🔎 Found ${selectedFixtures.length} matches in Strict Whitelist.`);

        if (selectedFixtures.length === 0) {
            console.log("❌ No Strict Whitelist matches found today. Returning empty.");
            // Do not return mocks. We want to show NOTHING if nothing matches.
        }

        const newPredictions = [];

        // 4. Generate Predictions
        for (const fixture of selectedFixtures) {
            console.log(`\n🔎 Processing: ${fixture.teams.home.name} vs ${fixture.teams.away.name}`);

            // Check if already exists (Fix: Handle String/Int mismatch)
            const exists = existingPredictions.find(p => p.fixtureId == fixture.fixture.id);
            if (exists) { console.log("   - Skipped (Exists)"); continue; }

            console.log("   - Fetching Context..."); // LOG
            const context = await getMatchContext(fixture);
            console.log("   - Generating AI Prediction..."); // LOG
            const aiResult = await generatePrediction(
                fixture.teams.home.name,
                fixture.teams.away.name,
                fixture.league.name,
                context
            );
            console.log("   - AI Result:", aiResult.prediction); // LOG

            // Determine Category
            let category = 'other';
            const pText = aiResult.prediction || "";
            if (pText.includes('Over')) category = 'goals';
            else if (pText.includes('Win')) category = 'win';
            else if (pText.includes('1X') || pText.includes('X2')) category = 'double';
            else if (pText.includes('Corners')) category = 'corners';

            console.log("   - Saving to DB..."); // LOG
            // Save to DB (Handle duplicates gracefully)
            try {
                const savedPrediction = await prisma.prediction.create({
                    data: {
                        date: new Date(fixture.fixture.date),
                        homeTeam: fixture.teams.home.name,
                        awayTeam: fixture.teams.away.name,
                        homeLogo: fixture.teams.home.logo, // Save Logo
                        awayLogo: fixture.teams.away.logo, // Save Logo
                        league: fixture.league.name,
                        prediction: aiResult.prediction || "Double Chance 1X",
                        odds: String(aiResult.odds || "1.50"), // Fix: Ensure String
                        confidence: parseInt(aiResult.confidence) || 75,
                        analysis: aiResult.analysis || `H2H: ${context.h2h}. Form: Home ${context.homeForm.slice(0, 5)}, Away ${context.awayForm.slice(0, 5)}. Style: ${context.strategy?.style || 'Balanced'}.`,
                        reasoning: aiResult.reasoning || "Based on recent form.",
                        result: 'PENDING',
                        type: aiResult.type || "Safe",
                        category: category,
                        isVolatile: aiResult.isVolatile || false,
                        fixtureId: parseInt(fixture.fixture.id)
                    }
                });

                newPredictions.push({
                    ...savedPrediction,
                    time: savedPrediction.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });
                console.log("   - Saved!");

            } catch (error) {
                if (error.code === 'P2002') {
                    console.log("   - Skipped (Duplicate ID found during save)");
                } else {
                    console.error("   - Save Failed:", error);
                }
            }

            newPredictions.push({
                ...savedPrediction,
                time: savedPrediction.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            console.log("   - Saved!"); // LOG

            // Rate limit delay (7s) to respect Free API limits (10 req/min)
            await new Promise(r => setTimeout(r, 7000));
        }

        if (newPredictions.length === 0) {
            console.log("❌ NO REAL GAMES FOUND. Returning empty per 'Real Data Only' policy.");
            // Do not return mocks.
        }

        // Return *All* predictions for today (new + existing)
        // Need to refetch or combine to ensure we return full list
        const allPredictions = await prisma.prediction.findMany({
            where: {
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        });

        return allPredictions.map(p => ({
            id: p.id,
            homeTeam: p.homeTeam,
            awayTeam: p.awayTeam,
            league: p.league,
            prediction: p.prediction,
            confidence: p.confidence,
            reasoning: p.reasoning,
            analysis: p.analysis,
            odds: p.odds,
            type: p.type,
            isVolatile: p.isVolatile,
            time: p.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            category: p.category
        }));

    } catch (error) {
        console.error("Prediction Logic Error:", error);
        return [];
    }
};
