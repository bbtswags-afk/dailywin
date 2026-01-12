import Groq from "groq-sdk";
import { getScrapedDailyFixtures } from "./footballApi.js";
import prisma from "./prisma.js";
import { getH2H_TSDB } from './theSportsDbService.js';
import { getFormFromScraper } from './scraperService.js'; // NEW SOURCE
import { getTrueDate } from "./timeService.js";

// --- KEY ROTATION UTILS ---
const getGroqKeys = () => {
    const raw = process.env.GROQ_API_KEY || "";
    return raw.split(',').map(k => k.trim()).filter(k => k.length > 10);
};

let currentKeyIndex = 0;

const getGroqClient = () => {
    const keys = getGroqKeys();
    if (keys.length === 0) throw new Error("No Groq Keys available in .env");

    // Rotate if index out of bounds (just safety)
    if (currentKeyIndex >= keys.length) currentKeyIndex = 0;

    const key = keys[currentKeyIndex];
    // console.log(`   🔑 Using Key #${currentKeyIndex + 1} (${key.substring(0,6)}...)`); 
    return new Groq({ apiKey: key });
};

const rotateKey = () => {
    const keys = getGroqKeys();
    if (keys.length <= 1) {
        console.log("   ⚠️ Only 1 key available. Cannot rotate.");
        return false;
    }
    currentKeyIndex = (currentKeyIndex + 1) % keys.length;
    console.log(`   🔄 Rotating to Key #${currentKeyIndex + 1}...`);
    return true;
};
// ---------------------------


export const getMatchContext = async (game, dateStr) => {
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
            getFormFromScraper(homeTeamName, awayTeamName, dateStr)
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
            const calcStats = (form) => {
                const wins = (form.match(/W/g) || []).length;
                const draws = (form.match(/D/g) || []).length;
                const losses = (form.match(/L/g) || []).length;
                return { scored: `${wins * 2}+`, conceded: `${losses}+` }; // Rough estimate
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

export const generatePrediction = async (context, homeTeam, awayTeam, league, retryCount = 0) => {
    try {
        const groq = getGroqClient();

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
        console.error(`❌ AI Error (Attempt ${retryCount + 1}):`, error.message);

        // CHECK FOR RATE LIMITS OR API ERRORS
        // 429 = Too Many Requests
        if ((error.status === 429 || error.message.includes('rate')) && retryCount < 3) {
            console.log("   ⚠️ Rate Limit Hit!");

            const switched = rotateKey();
            if (switched) {
                // Wait small delay then retry with new key
                await new Promise(r => setTimeout(r, 2000));
                return generatePrediction(context, homeTeam, awayTeam, league, retryCount + 1);
            }
        }

        // Basic Fallback if AI fails completely
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

export const generateDailyPredictions = async (targetDateString) => {
    try {
        const dateStr = process.env.OVERRIDE_DATE || targetDateString;
        let today;
        if (dateStr) {
            today = new Date(dateStr);
            // Ensure we handle plain date strings correctly if passed
            if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                // Treat as UTC midnight to avoid timezone shifts if just date is given
                today = new Date(`${dateStr}T00:00:00.000Z`);
            }
        } else {
            today = await getTrueDate();
        }

        console.log(`🤖 AI Engine Processing for: ${today.toISOString().split('T')[0]}`);

        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        // --- STEP 0: Check if we already have today's full batch ---
        // If we have > 10 predictions, we assume it's done. 
        // This prevents double-costs if the script re-runs.
        const existingCount = await prisma.prediction.count({
            where: { date: { gte: startOfDay, lte: endOfDay } }
        });

        // IF CALLED FROM SCHEDULER: user might want to force regen?
        // But generally, if we have data, we serve it.
        // If you need FORCE REGEN, use separate script.
        if (existingCount >= 10) {
            console.log(`✅ Data already exists (${existingCount} games). Loading from DB...`);
            return await getPredictionsFromDB(startOfDay, endOfDay);
        }


        // --- STEP 1: CLEANUP YESTERDAY ---
        // Just keep DB clean.
        await prisma.prediction.deleteMany({
            where: {
                date: { lt: startOfDay }
            }
        });
        console.log("🧹 Cleared old predictions from DB.");


        // --- STEP 2: Fetch Fixtures ---
        console.log("Fetching new fixtures from API...");
        const data = await getScrapedDailyFixtures(dateStr);

        if (!data.response || data.response.length === 0) {
            console.log("No fixtures found today.");
            return [];
        }

        // --- STEP 3: Filter & Balance ---
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

        // Simple balancing (Top 15 max)
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

        // Round-robin selection
        while (balancedFixtures.length < TARGET_LIMIT && keys.length > 0) {
            const key = keys[i % keys.length];
            if (grouped[key].length > 0) {
                balancedFixtures.push(grouped[key].shift());
            }
            i++;
            if (i > 100) break;
        }

        selectedFixtures = balancedFixtures.length > 0 ? balancedFixtures : selectedFixtures.slice(0, 15);
        console.log(`🔎 Processing Top ${selectedFixtures.length} matches.`);


        // --- STEP 4: SLOW & STEADY GENERATION ---
        const newPredictions = [];

        for (const [index, fixture] of selectedFixtures.entries()) {
            try {
                // THROTTLING WAIT (8 Seconds)
                // We skip waiting for the FIRST one.
                if (index > 0) {
                    console.log(`zzz Sleeping 8s to respect API Speed Limit...`);
                    await new Promise(resolve => setTimeout(resolve, 8000));
                }

                const homeTeam = fixture.teams.home.name;
                const awayTeam = fixture.teams.away.name;
                const league = fixture.league.name;

                console.log(`\n[${index + 1}/${selectedFixtures.length}] 🔎 Analyzing: ${homeTeam} vs ${awayTeam}`);

                // Calculate Simple Date String (YYYY-MM-DD) from the main loop's 'today' object
                const simpleDateStr = today.toISOString().split('T')[0];

                const context = await getMatchContext(fixture, simpleDateStr);

                if (!context) {
                    console.log(`   - Skipped: No Real Data available.`);
                    continue;
                }

                const prediction = await generatePrediction(context, homeTeam, awayTeam, league);
                const marketValue = prediction.prediction || "Double Chance 1X";
                console.log(`   - 🧠 AI Says: ${marketValue}`);

                let category = "Safe";
                if (marketValue.includes("Win")) category = "Straight Wins";
                if (marketValue.includes("Corner")) category = "Corners";
                if (marketValue.includes("Double")) category = "Double Chance";
                if (marketValue.includes("Over") || marketValue.includes("Under")) category = "Goals";

                // Save Immediately to DB
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
                        homeForm: context.homeForm,
                        awayForm: context.awayForm,
                        fixtureId: parseInt(fixture.fixture.id)
                    }
                });

                console.log(`   - 💾 Saved to DB.`);
                newPredictions.push(savedPrediction);

            } catch (err) {
                console.error(`❌ Error processing fixture:`, err.message);
                continue;
            }
        }

        return getPredictionsFromDB(startOfDay, endOfDay);

    } catch (error) {
        console.error("Prediction Logic Error:", error);
        return [];
    }
};

// Helper to format output consistently
async function getPredictionsFromDB(start, end) {
    const all = await prisma.prediction.findMany({
        where: {
            date: { gte: start, lte: end }
        }
    });

    return all.map(p => ({
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
        category: p.category,
        homeLogo: p.homeLogo,
        awayLogo: p.awayLogo,
        form: {
            home: typeof p.homeForm === 'string' ? p.homeForm.split('') : [],
            away: typeof p.awayForm === 'string' ? p.awayForm.split('') : []
        }
    }));
}
