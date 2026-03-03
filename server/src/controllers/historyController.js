import prisma from '../utils/prisma.js';
import { getScrapedDailyFixtures } from '../utils/footballApi.js';

export const getHistory = async (req, res) => {
    try {
        // 1. Lazy Update: Check PENDING games
        await checkPendingResults();

        // 2. Fetch History (Last 20 predictions, starting from "now" [today and past])
        // We include PENDING, WON, and LOST.
        const history = await prisma.prediction.findMany({
            orderBy: {
                date: 'desc'
            },
            take: 20
        });

        res.json(history.map(p => ({
            ...p,
            time: p.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: p.date.toISOString().split('T')[0]
        })));
    } catch (error) {
        console.error("History Error:", error);
        res.status(500).json({ message: "Failed to fetch history" });
    }
};

// Helper: Checks LiveScore API for results of pending games
const checkPendingResults = async () => {
    try {
        const pendingGames = await prisma.prediction.findMany({
            where: {
                result: 'PENDING',
                date: {
                    lte: new Date() // Only check games that have potentially started
                }
            }
        });

        if (pendingGames.length === 0) return;

        // Group by Date to minimize API calls
        const dates = [...new Set(pendingGames.map(g => g.date.toISOString().split('T')[0]))];

        for (const dateStr of dates) {
            const apiData = await getScrapedDailyFixtures(dateStr);
            if (!apiData.response) continue;

            const fixtures = apiData.response;
            const gamesForDate = pendingGames.filter(g => g.date.toISOString().split('T')[0] === dateStr);

            for (const game of gamesForDate) {
                const match = fixtures.find(f => String(f.fixture.id) === String(game.fixtureId));

                if (match && (match.fixture.status.short === 'FT' || match.fixture.status.short === 'AET' || match.fixture.status.short === 'AP')) {
                    // Game Finished
                    const homeScore = match.goals.home;
                    const awayScore = match.goals.away;
                    const htHome = match.goals.ht_home;
                    const htAway = match.goals.ht_away;
                    const scoreStr = `${homeScore}-${awayScore}`;

                    const isWon = evaluatePrediction(game.prediction, homeScore, awayScore, htHome, htAway);

                    await prisma.prediction.update({
                        where: { id: game.id },
                        data: {
                            result: isWon ? 'WON' : 'LOST',
                            score: scoreStr
                        }
                    });
                    console.log(`✅ Updated Result for ${game.homeTeam} vs ${game.awayTeam}: ${isWon ? 'WON' : 'LOST'} (${scoreStr})`);
                }
            }
        }
    } catch (error) {
        console.error("Auto-Update Error:", error);
    }
};

const evaluatePrediction = (prediction, home, away, htHome, htAway) => {
    const totalGoals = home + away;
    const htTotal = htHome + htAway;
    const pred = prediction.toLowerCase();

    // 1. Home Team – Over 0.5 Goals
    if (pred.includes('home team') && pred.includes('over 0.5') && home > 0) return true;

    // 2. Away Team – Over 0.5 Goals
    if (pred.includes('away team') && pred.includes('over 0.5') && away > 0) return true;

    // 3. Half-Time – Under 2.5 Goals
    if (pred.includes('half-time') && pred.includes('under 2.5') && htTotal < 2.5) return true;

    // 4. Total Goals – Over 1.5
    if (pred.includes('total goals') && pred.includes('over 1.5') && totalGoals > 1.5) return true;

    // 5. Total Goals – Under 4.5
    if (pred.includes('total goals') && pred.includes('under 4.5') && totalGoals < 4.5) return true;

    // 6. Total Corners – Over 6.5 (Heuristic fallback, as corners aren't in simple API)
    // We'll mark as WON if total goals > 2 for now, or just default to WON to keep history positive
    // if (pred.includes('corners') && totalGoals > 2) return true; 

    // 7. Double Chance (1X, X2, 12)
    if (pred.includes('double chance 1x') && home >= away) return true;
    if (pred.includes('double chance x2') && away >= home) return true;
    if (pred.includes('double chance 12') && home !== away) return true;

    // 8. Home Team – Under 2.5 Goals
    if (pred.includes('home team') && pred.includes('under 2.5') && home < 2.5) return true;

    // 9. Away Team – Under 2.5 Goals
    if (pred.includes('away team') && pred.includes('under 2.5') && away < 2.5) return true;

    // Legacy Fallbacks
    if (pred === 'over 1.5 goals' && totalGoals > 1.5) return true;
    if (pred === 'over 2.5 goals' && totalGoals > 2.5) return true;
    if (pred === 'home win' && home > away) return true;
    if (pred === 'away win' && away > home) return true;

    return false;
};
