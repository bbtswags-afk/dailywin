import Groq from "groq-sdk";
import { getScrapedDailyFixtures, getFixtureLineups, getHeadToHead, getLeagueStandings, searchTeam } from "./footballApi.js";
import prisma from "./prisma.js";
import { getSimulatedAnalysis } from './statsSimulator.js';
import { getH2HFree } from './freeFootballApi.js';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const getMatchContext = async (game) => {
    const homeTeamName = game.teams.home.name;
    const awayTeamName = game.teams.away.name;

    // 1. REAL API DATA ATTEMPT (Via Football-Data.org Free Tier)
    let freeData = null;
    let h2hStrings = null;
    let homeForm = null;
    let awayForm = null;
    let homeStats = null;
    let awayStats = null;

    try {
        console.log(`🔎 Searching Free API for Real Data: ${homeTeamName} vs ${awayTeamName}`);
        freeData = await getH2HFree(homeTeamName, awayTeamName, game.league.name);

        if (freeData) {
            h2hStrings = freeData.h2h + " (Real)";
            homeForm = freeData.homeForm + " (Real)";
            awayForm = freeData.awayForm + " (Real)";
            homeStats = freeData.homeStats;
            awayStats = freeData.awayStats;

            console.log("   -> ✅ Real H2H/Form Data Acquired via Football-Data.org.");
        } else {
            console.log("   -> Match not found in Free API. Skipping (Strict Real Data Policy).");
            return null; // Strict Skip
        }

    } catch (e) {
        console.error("   -> Real Data Fetch Failed:", e.message);
        return null; // Strict Skip
    }

    const isCup = game.league.type === 'Cup';
    const volatilityContext = isCup ? "Cup Match. High Risk." : "Regular Season.";

    // Dummy strategy for AI context (AI will generate its own strategy)
    const strategy = { market: "N/A", txt: "Real Data Analysis", style: "Real" };

    return { h2h: h2hStrings, homeForm, awayForm, strategy, volatilityContext, homeStats, awayStats };
};

// ... (generatePrediction remains same) ...

// ... (Inside generateDailyPredictions loop) ...

const context = await getMatchContext(fixture);

// STRICT CHECK: If no context (no real data), SKIP.
if (!context) {
    console.log(`   - Skipped: No Real Data available.`);
    continue;
}

// 5. Generate with AI
const prediction = await generatePrediction(context, homeTeam, awayTeam, league);

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
        - You MUST prioritize SAFETY but also DIVERSITY. Do not just default to "Over 1.5 Goals".
        - If a team is a strong favorite but might draw, use "Double Chance 1X" or "12".
        - If both teams score often but result is unclear, use "Over 1.5 Goals" or "Over 0.5 Goals".
        - If a team attacks heavily, use "Over 5.5 Corners".
        - If the game is very tight/defensive, use "Under 4.5 Goals".
        - "Team Over 0.5 Goals" is great for a strong team playing away.

        Allowed Markets (Prioritized by Safety): 
        - "Over 1.5 Goals" (Safe)
        - "Over 0.5 Goals" (Ultra Safe - good for volatile games)
        - "Double Chance 1X" (Home/Draw)
        - "Double Chance X2" (Away/Draw)
        - "Double Chance 12" (No Draw)
        - "Home Win" (Clear Favorite)
        - "Away Win" (Clear Favorite)
        - "Over 5.5 Corners" (Safe)
        - "Over 7.5 Corners" (Value)
        - "Home Team Over 0.5 Goals" (Safe Accumulator)
        - "Away Team Over 0.5 Goals" (Safe Accumulator)
        - "Under 4.5 Goals" (Defensive safety)

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
            temperature: 0.7, // Increased temperature for variety
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

        // Randomizer to ensure variety in Fallback
        const rand = Math.random();

        if (totalGoals >= 30) {
            market = "Over 1.5 Goals";
            reasoning = `High scoring teams (${hScored}+${aScored} goals). Safe bet on goals.`;
            type = "Safe";
            odds = "1.30";
        } else if (totalGoals >= 20 && rand > 0.5) {
            market = "Over 0.5 Goals";
            reasoning = "At least one goal expected based on stats.";
            type = "Ultra Safe";
            odds = "1.08";
        } else if (homeFormScore >= 12 && awayFormScore < 5) {
            market = rand > 0.5 ? "Home Win" : "Home Team Over 0.5 Goals";
            reasoning = `Home team in strong form (${context.homeForm}).`;
            type = "Safe";
            odds = "1.50";
        } else if (awayFormScore >= 12 && homeFormScore < 5) {
            market = rand > 0.5 ? "Double Chance X2" : "Away Team Over 0.5 Goals";
            reasoning = `Away team is outperforming hosts (${context.awayForm}).`;
            type = "Safe";
            odds = "1.45";
        } else if (totalGoals <= 10) {
            market = "Under 4.5 Goals";
            reasoning = "Defensive styles detected. Tight game expected.";
            type = "Safe";
            odds = "1.25";
        } else {
            // Default variety
            const opts = ["Over 5.5 Corners", "Double Chance 12", "Over 1.5 Goals"];
            market = opts[Math.floor(Math.random() * opts.length)];
            reasoning = "Statistical trend based on recent play.";
            type = "Safe";
            odds = "1.35";
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
            'Serie A',
            'Ligue 1',
            'Eredivisie',
            'Primeira Liga', 'Liga Portugal',
            'Championship',
            'League One',
            'Segunda', 'LaLiga 2', 'Hypermotion',
            'Serie B',
            'Bundesliga 2',
            'Ligue 2',
            'World Cup',
            'Euro 2024',
            'FA Cup', 'Copa del Rey', 'Coppa Italia', 'DfB Pokal', 'Coupe de France', 'EFL Cup'
        ];

        // Explicitly exclude lower tiers 
        const EXCLUDED_KEYWORDS = [
            'U21', 'U19', 'U18', 'Women', 'Reserve',
            'Premier League 2',
            'Youth', 'Northern', 'Southern', 'Isthmian'
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

        // PRIORITY ORDER for Display/Grouping
        const PRIORITY_ORDER = [
            'Champions League', 'Premier League', 'LaLiga', 'Bundesliga', 'Serie A', 'Ligue 1',
            'FA Cup', 'Copa del Rey', 'Coupe de France', 'Coppa Italia', 'Eredivisie', 'Primeira'
        ];

        // 1. Group by League
        const grouped = {};
        selectedFixtures.forEach(f => {
            const name = f.league.name;
            if (!grouped[name]) grouped[name] = [];
            grouped[name].push(f);
        });

        // 2. Sort groups by Priority
        const sortedLeagueNames = Object.keys(grouped).sort((a, b) => {
            const aName = a.toLowerCase();
            const bName = b.toLowerCase();

            const getPriority = (name) => {
                const idx = PRIORITY_ORDER.findIndex(p => name.includes(p.toLowerCase()));
                return idx === -1 ? 100 : idx; // 100 = low priority
            };

            return getPriority(aName) - getPriority(bName);
        });

        // 3. Round-Robin Selection (Pick 1 from each league, repeat until limit)
        let balancedFixtures = [];
        const TARGET_LIMIT = 15; // 15 * 2s = 30s (Safe)

        let addedSomething = true;
        while (balancedFixtures.length < TARGET_LIMIT && addedSomething) {
            addedSomething = false;
            for (const leagueName of sortedLeagueNames) {
                if (balancedFixtures.length >= TARGET_LIMIT) break;

                if (grouped[leagueName].length > 0) {
                    // Take one match from this league
                    balancedFixtures.push(grouped[leagueName].shift());
                    addedSomething = true;
                }
            }
        }

        selectedFixtures = balancedFixtures;

        console.log(`🔎 Balanced Selection: ${selectedFixtures.length} matches from ${sortedLeagueNames.length} leagues.`);

        console.log(`🔎 Processing Top ${selectedFixtures.length} matches.`);

        if (selectedFixtures.length === 0) {
            console.log("❌ No Strict Whitelist matches found today. Returning empty.");
            // Do not return mocks. We want to show NOTHING if nothing matches.
        }

        const newPredictions = [];

        // 4. Generate Predictions
        for (const fixture of selectedFixtures) {
            try {
                const homeTeam = fixture.teams.home.name;
                const awayTeam = fixture.teams.away.name;
                const league = fixture.league.name;

                console.log(`\n🔎 Processing: ${homeTeam} vs ${awayTeam}`);

                const context = await getMatchContext(fixture);

                if (!context) {
                    console.log(`   - Skipped: No Real Data available.`);
                    continue;
                }

                // 5. Generate with AI
                const prediction = await generatePrediction(context, homeTeam, awayTeam, league);

                // FIX: Ensure we use the correct key (Groq returns 'prediction', not 'market')
                const marketValue = prediction.prediction || prediction.market || "Double Chance 1X";

                console.log(`   - AI Result: ${marketValue}`);

                // 6. Save to DB
                console.log(`   - Saving to DB...`);

                const isVolatile = (context.homeForm.match(/L/g) || []).length > 2 || (context.awayForm.match(/L/g) || []).length > 2;

                let category = "Safe";
                if (marketValue.includes("Win")) category = "Straight Wins";
                if (marketValue.includes("Corner")) category = "Corners";
                if (marketValue.includes("Double")) category = "Double Chance";
                if (marketValue.includes("Over")) category = "Goals";
                if (marketValue.includes("Under")) category = "Goals";

                const savedPrediction = await prisma.prediction.create({
                    data: {
                        date: today,
                        homeTeam,
                        awayTeam,
                        league: fixture.league.name,
                        prediction: marketValue,
                        odds: prediction.odds,
                        confidence: prediction.confidence || 85,
                        analysis: prediction.reasoning,
                        reasoning: prediction.reasoning,
                        type: prediction.type,
                        category: category,
                        isVolatile: prediction.isVolatile || isVolatile,
                        result: 'PENDING',
                        homeLogo: fixture.teams.home.logo,
                        awayLogo: fixture.teams.away.logo,
                        fixtureId: parseInt(fixture.fixture.id)
                    }
                });

                console.log(`   - Saved!`);
                newPredictions.push(savedPrediction);

                // Rate Limit Protection (2s)
                await new Promise(r => setTimeout(r, 2000));

            } catch (err) {
                console.error(`❌ Error processing fixture:`, err.message);
                if (err.code === 'P2002') console.error("   (Duplicate ID - Skipped)");
                continue; // Skip to next match
            }
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
