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
    const result = { ...p, h2h: "N/A", form: { home: [], away: [] } };

    if (p.analysis && p.analysis.includes("H2H:")) {
        // Parse H2H
        // Format: "H2H: A vs B; C vs D. Form: Home WWLLL, Away LLLWW. Style: ..."
        const h2hMatch = p.analysis.match(/H2H: (.*?)\. Form:/);
        if (h2hMatch) result.h2h = h2hMatch[1];

        // Parse Form
        const homeFormMatch = p.analysis.match(/Form: Home ([A-Z,]+)/);
        const awayFormMatch = p.analysis.match(/Away ([A-Z,]+)/);

        if (homeFormMatch) result.form.home = homeFormMatch[1].split('').filter(c => ['W', 'D', 'L'].includes(c));
        if (awayFormMatch) result.form.away = awayFormMatch[1].split('').filter(c => ['W', 'D', 'L'].includes(c));
    }
    return result;
};

export const getPredictions = async (req, res) => {
    try {
        // Always try to generate/fetch valid predictions for today
        const predictions = await generateDailyPredictions();

        let user = req.user;

        // 0. Handle "View as Guest" override
        if (req.query.view === 'guest') {
            user = null;
        }

        // 1. Guest View (1 Game Visible, but Analysis Locked)
        if (!user) {
            const guestPredictions = predictions.slice(0, 1).map(p => {
                // Return the game details but HIDE the deep analysis
                const basic = enrichPrediction(p);
                return {
                    ...basic,
                    analysis: "🔒 Login to view detailed analysis", // Hide analysis
                    reasoning: p.reasoning, // Keep reasoning? User said: "cannot see analysis for it"
                    isGuestLocked: true // Frontend flag to show blur
                };
            });
            // Guest only sees 1 game, not the full list locked. User said "can only see one game, and the others will be locked".
            // Actually, if we return only 1 game, they can't see the "others locked".

            // Re-reading: "guest users, they can only see one game, and the others will be locked."
            // So we need to return ALL, but 2..N are locked.

            const allGuest = predictions.map((p, index) => {
                if (index < 1) {
                    return {
                        ...enrichPrediction(p),
                        analysis: "🔒 Login to view analysis", // Locked for Guest
                        h2h: "🔒 Login to view",
                        form: { home: [], away: [] } // Hide form details? "cannot see analysis" usually implies deep data.
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

            return res.json(allGuest);
        }

        // 2. Check Subscription Logic
        const now = new Date();
        const isPremium = user.plan.startsWith('premium') &&
            user.subscriptionStatus === 'active' &&
            user.subscriptionEnd && new Date(user.subscriptionEnd) > now;

        // 3. Free User View (1 Game Unlocked, Rest Locked)
        if (!isPremium) {
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
        res.json(predictions.map(enrichPrediction));

    } catch (error) {
        console.error("Prediction Error:", error);
        res.status(500).json({ message: "Failed to generate predictions" });
    }
};
