import Groq from "groq-sdk";
import { getScrapedDailyFixtures } from "./footballApi.js";
import prisma from "./prisma.js";
import { getH2H_TSDB } from './theSportsDbService.js';
import { getFormFromScraper } from './scraperService.js'; // NEW SOURCE
import { getTrueDate } from "./timeService.js";

export const getMatchContext = async (game) => {
    const homeTeamName = game.teams.home.name;
    const awayTeamName = game.teams.away.name;

    // Default Context
    let context = {
        h2h: "No H2H available.",
        homeForm: "N/A",
        awayForm: "N/A",
        volatilityContext: game.league.type === 'Cup' ? "Cup Match. High Risk." : "Regular Season.",
        homeStats: { scored: '?', conceded: '?' },
        awayStats: { scored: '?', conceded: '?' }
    };

    try {
        console.log(`🔎 Match Context: Fetching Rich Data for ${homeTeamName} vs ${awayTeamName}`);

        // Run Hybrid Fetch in Parallel
        const [tsdbData, scraperData] = await Promise.all([
            getH2H_TSDB(homeTeamName, awayTeamName),
            getFormFromScraper(homeTeamName, awayTeamName)
        ]);

        // 1. Process H2H (from TheSportsDB)
        if (tsdbData && tsdbData.h2h) {
            context.h2h = tsdbData.h2h;
            if (tsdbData.homeLogo) context.homeLogo = tsdbData.homeLogo;
            if (tsdbData.awayLogo) context.awayLogo = tsdbData.awayLogo;
            console.log("   -> ✅ H2H Acquired (TheSportsDB).");
        }

        // 2. Process Form (from Scraper)
        if (scraperData && scraperData.homeForm !== "N/A") {
            context.homeForm = scraperData.homeForm;
            context.awayForm = scraperData.awayForm;
            console.log(`   -> ✅ Form Acquired (Scraper): ${context.homeForm} vs ${context.awayForm}`);

            // Simple Stats Derivation from Form String (e.g. "WWLDW")
            // This is loose, but gives the AI "stats" to reference.
            const calcStats = (form) => {
                const wins = (form.match(/W/g) || []).length;
                const draws = (form.match(/D/g) || []).length;
                const losses = (form.match(/L/g) || []).length;
                return { scored: `${wins * 2}+`, conceded: `${losses}+` }; // Rough estimate for AI context
            };

            context.homeStats = calcStats(context.homeForm);
            context.awayStats = calcStats(context.awayForm);
        } else {
            console.log("   -> ⚠️ Scraper failed or no data. Using N/A.");
        }

    } catch (e) {
        console.error("   -> Context Fetch Error:", e.message);
    }

    return context;
};

export const generatePrediction = async (context, homeTeam, awayTeam, league) => {
    try {
        const GROQ_API_KEY = process.env.GROQ_API_KEY; // Read safely at runtime
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

        Task: Analyze the SCORE LINES of the last 5 games. How did they win/lose? (e.g. tight 1-0 or dominant 4-0?).
        Run a debate between The Scout and The Accountant.
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
            temperature: 0.7,
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

        // Basic Fallback if AI fails (but using rich data)
        return {
            prediction: "Double Chance 1X",
            odds: "1.30",
            confidence: 60,
            reasoning: "AI Service Unreachable. Defaulting to safe home preference.",
            type: "Safe",
            isVolatile: true
        };
    }
};

export const generateDailyPredictions = async () => {
    try {
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

        // CLEANUP: Remove old pending predictions
        await prisma.prediction.deleteMany({
            where: {
                date: {
                    not: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                },
                result: 'PENDING'
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

        if (existingPredictions.length >= 6) {
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
            console.log("No fixtures found today.");
            return [];
        }

        // 3. Strict League Filtering
        const STRICT_LEAGUES = [
            'Champions League', 'Premier League', 'LaLiga', 'La Liga', 'Primera Division',
            'Bundesliga', 'Serie A', 'Ligue 1', 'Eredivisie', 'Primeira Liga', 'Liga Portugal',
            'Championship', 'League One', 'Segunda', 'LaLiga 2', 'Hypermotion',
            'Serie B', 'Bundesliga 2', 'Ligue 2', 'FA Cup', 'Copa del Rey', 'Coppa Italia', 'DfB Pokal', 'Coupe de France', 'EFL Cup'
        ];

        const EXCLUDED_KEYWORDS = ['U21', 'U19', 'U18', 'Women', 'Reserve', 'Premier League 2', 'Youth'];

        let selectedFixtures = data.response.filter(f => {
            const leagueName = f.league.name;
            const isExcluded = EXCLUDED_KEYWORDS.some(bad => leagueName.includes(bad));
            if (isExcluded) return false;
            return STRICT_LEAGUES.some(keyword => leagueName.includes(keyword));
        });

        // Sort and Limit
        // ... (Keep existing sorting logic if needed, but for brevity, assuming existing logic or simple slice)
        // For balanced diversity:
        const grouped = {};
        selectedFixtures.forEach(f => {
            const name = f.league.name;
            if (!grouped[name]) grouped[name] = [];
            grouped[name].push(f);
        });

        let balancedFixtures = [];
        const TARGET_LIMIT = 15;
        const keys = Object.keys(grouped);

        let i = 0;
        while (balancedFixtures.length < TARGET_LIMIT && keys.length > 0) {
            const key = keys[i % keys.length];
            if (grouped[key].length > 0) {
                balancedFixtures.push(grouped[key].shift());
            }
            i++;
            // Break if we run out (simple check logic omitted for brevity, expecting enough matches)
            if (i > 100) break; // Safety
        }

        selectedFixtures = balancedFixtures.length > 0 ? balancedFixtures : selectedFixtures.slice(0, 15);

        console.log(`🔎 Processing Top ${selectedFixtures.length} matches.`);

        const newPredictions = [];

        // 4. Generate Predictions (FAST - No Artificial Delay)
        for (const fixture of selectedFixtures) {
            try {
                const homeTeam = fixture.teams.home.name;
                const awayTeam = fixture.teams.away.name;
                const league = fixture.league.name;

                console.log(`\n🔎 Processing: ${homeTeam} vs ${awayTeam}`);

                const context = await getMatchContext(fixture);

                if (!context) {
                    console.log(`   - Skipped: No Real Data available.`);
                    continue; // Skip freely, no penalty
                }

                // 5. Generate with AI
                const prediction = await generatePrediction(context, homeTeam, awayTeam, league);
                const marketValue = prediction.prediction || "Double Chance 1X";
                console.log(`   - AI Result: ${marketValue}`);

                // 6. Save to DB
                let category = "Safe";
                if (marketValue.includes("Win")) category = "Straight Wins";
                if (marketValue.includes("Corner")) category = "Corners";
                if (marketValue.includes("Double")) category = "Double Chance";
                if (marketValue.includes("Over") || marketValue.includes("Under")) category = "Goals";

                const savedPrediction = await prisma.prediction.create({
                    data: {
                        date: today,
                        homeTeam,
                        awayTeam,
                        league: fixture.league.name,
                        prediction: marketValue,
                        odds: String(prediction.odds),
                        confidence: prediction.confidence || 85,
                        analysis: prediction.reasoning,
                        reasoning: prediction.reasoning,
                        type: prediction.type,
                        category: category,
                        isVolatile: prediction.isVolatile || true,
                        result: 'PENDING',
                        homeLogo: context.homeLogo || fixture.teams.home.logo,
                        awayLogo: context.awayLogo || fixture.teams.away.logo,
                        fixtureId: parseInt(fixture.fixture.id)
                    }
                });

                console.log(`   - Saved!`);
                newPredictions.push(savedPrediction);

            } catch (err) {
                console.error(`❌ Error processing fixture:`, err.message);
                continue;
            }
        }

        // Return combined list
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
