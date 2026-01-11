import { generateDailyPredictions } from '../utils/aiEngine.js';
import { getLiveScores } from '../utils/footballApi.js';
import prisma from '../utils/prisma.js';

// In-memory cache for predictions (optional, can be expanded)
let predictionsCache = {
    data: [],
    lastUpdated: 0
};

const CACHE_DURATION = 60 * 60 * 1000; // 1 Hour

export const getLive = async (req, res) => {
    try {
        const data = await getLiveScores();
        res.json(data);
    } catch (error) {
        console.error("Live Score Error:", error);
        res.status(500).json({ response: [] });
    }
};

// Helper to parse detailed analysis string into structured props
const enrichPrediction = (p) => {
    // START with the existing values (don't overwrite with defaults yet)
    let h2h = p.h2h || "N/A";
    let form = p.form || { home: [], away: [] };

    // Parse legacy format ONLY if data is missing
    if (p.analysis && p.analysis.includes("H2H:") && h2h === "N/A") {
        const h2hMatch = p.analysis.match(/H2H: (.*?)\. Form:/);
        if (h2hMatch) h2h = h2hMatch[1];
    }

    if (p.analysis && (!form.home || form.home.length === 0)) {
        const homeFormMatch = p.analysis.match(/Form: Home ([A-Z,]+)/);
        const awayFormMatch = p.analysis.match(/Away ([A-Z,]+)/);

        if (homeFormMatch) form.home = homeFormMatch[1].split('').filter(c => ['W', 'D', 'L'].includes(c));
        if (awayFormMatch) form.away = awayFormMatch[1].split('').filter(c => ['W', 'D', 'L'].includes(c));
    }

    return { ...p, h2h, form };
};

export const getPredictions = async (req, res) => {
    try {
        const predictions = await generateDailyPredictions();
        console.log(`📊 Controller: Found ${predictions.length} predictions.`);

        let user = req.user;
        console.log(`👤 User Context: ${user ? `${user.email} (${user.plan})` : 'Guest'}`);

        // 0. Handle "View as Guest" override
        if (req.query.view === 'guest') {
            user = null;
            console.log("👀 View Mode: Forced Guest");
        }

        // 1. Guest View (1 Game Visible, but Analysis Locked)
        if (!user) {
            console.log("🔒 Access: Applying GUEST restrictions.");
            const guestPredictions = predictions.map((p, index) => {
                const basic = enrichPrediction(p);
                if (index < 1) {
                    return {
                        ...basic,
                        analysis: "🔒 Login to view analysis", // Locked for Guest
                        reasoning: p.reasoning ? p.reasoning.substring(0, 50) + "..." : "Log in to see why.",
                        h2h: "🔒 Login to view",
                        form: basic.form // Guests CAN see form visuals (badges), that's usually fine
                    };
                }
                // Rest are fully locked
                return {
                    id: p.id,
                    homeTeam: p.homeTeam,
                    awayTeam: p.awayTeam,
                    homeLogo: p.homeLogo,
                    awayLogo: p.awayLogo,
                    league: p.league,
                    time: p.time,
                    category: p.category,
                    prediction: "LOCKED 🔒",
                    reasoning: "🔒 Login required",
                    analysis: "🔒 Locked",
                    odds: "🔒",
                    confidence: "🔒",
                    isLocked: true
                };
            });
            return res.json(guestPredictions);
        }

        // 2. Check Subscription Logic
        const now = new Date();
        const isPremium = user.plan.startsWith('premium') &&
            user.subscriptionStatus === 'active' &&
            user.subscriptionEnd && new Date(user.subscriptionEnd) > now;

        console.log(`💎 Access: Is Premium? ${isPremium}`);

        // 3. Free User View (1 Game Unlocked, Rest Locked)
        if (!isPremium) {
            console.log("🔓 Access: Applying FREE USER restrictions.");
            const freePredictions = predictions.map((p, index) => {
                // First 1 is FULLY unlocked
                if (index < 1) return enrichPrediction(p);

                // The rest are LOCKED
                return {
                    id: p.id,
                    homeTeam: p.homeTeam,
                    awayTeam: p.awayTeam,
                    homeLogo: p.homeLogo,
                    awayLogo: p.awayLogo,
                    league: p.league,
                    time: p.time,
                    category: p.category,
                    prediction: "LOCKED 🔒",
                    reasoning: "High-value prediction available for Premium members.",
                    analysis: "This detailed AI analysis is reserved for premium members. Upgrade to unlock.",
                    odds: "HIDDEN",
                    confidence: "HIDDEN",
                    isLocked: true,
                    h2h: "LOCKED",
                    form: { home: [], away: [] }
                };
            });
            return res.json(freePredictions);
        }

        // 4. Premium View (All Access)
        console.log("✨ Access: PREMIUM UNLOCKED. Serving all.");
        res.json(predictions.map(enrichPrediction));

    } catch (error) {
        console.error("Prediction Error:", error);
        res.status(500).json({ message: "Failed to generate predictions" });
    }
};
