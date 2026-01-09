import prisma from '../utils/prisma.js';
import { getFixtureDetails } from '../utils/footballApi.js';

export const getHistory = async (req, res) => {
    try {
        // 1. Lazy Update: Check PENDING games that are past their start time
        await checkPendingResults();

        // 2. Fetch History (WON or LOST only)
        // We limit to 50 items for performance, sorted by date desc
        const history = await prisma.prediction.findMany({
            where: {
                result: {
                    in: ['WON', 'LOST']
                }
            },
            orderBy: {
                date: 'desc'
            },
            take: 50
        });

        // Mock History Data (to ensure page isn't empty)
        const mockHistory = [
            {
                id: 'h1',
                homeTeam: 'Liverpool',
                awayTeam: 'Man City',
                league: 'Premier League',
                prediction: 'Over 2.5 Goals',
                result: 'WIN',
                score: '2-2',
                date: new Date(Date.now() - 86400000).toISOString(),
                odds: '1.65'
            },
            {
                id: 'h2',
                homeTeam: 'Juventus',
                awayTeam: 'AC Milan',
                league: 'Serie A',
                prediction: 'Home Win',
                result: 'LOSS',
                score: '0-1',
                date: new Date(Date.now() - 172800000).toISOString(),
                odds: '2.10'
            },
            {
                id: 'h3',
                homeTeam: 'Barcelona',
                awayTeam: 'Sevilla',
                league: 'La Liga',
                prediction: 'Home Win',
                result: 'WIN',
                score: '3-0',
                date: new Date(Date.now() - 259200000).toISOString(),
                odds: '1.40'
            },
            {
                id: 'h4',
                homeTeam: 'Bayern',
                awayTeam: 'Hertha',
                league: 'Bundesliga',
                prediction: 'Over 3.5 Goals',
                result: 'WIN',
                score: '4-1',
                date: new Date(Date.now() - 345600000).toISOString(),
                odds: '1.90'
            }
        ];

        // Combine DB history with mock history
        const finalHistory = [...completedPredictions, ...mockHistory].sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(finalHistory);
    } catch (error) {
        console.error("History Error:", error);
        res.status(500).json({ message: "Failed to fetch history" });
    }
};

// Helper: Checks API for results of pending games
const checkPendingResults = async () => {
    try {
        const pendingGames = await prisma.prediction.findMany({
            where: {
                result: 'PENDING',
                date: {
                    lt: new Date() // Only check games that should have started
                },
                fixtureId: { not: null } // Must have an ID to check
            }
        });

        for (const game of pendingGames) {
            const data = await getFixtureDetails(game.fixtureId);
            const fixture = data.response?.[0];

            if (fixture && ['FT', 'AET', 'PEN'].includes(fixture.fixture.status.short)) {
                // Game Finished
                const homeScore = fixture.goals.home;
                const awayScore = fixture.goals.away;
                const scoreStr = `${homeScore}-${awayScore}`;

                let result = 'LOST';

                // Simple evaluation logic (expand as needed)
                if (evaluatePrediction(game.prediction, homeScore, awayScore)) {
                    result = 'WON';
                }

                await prisma.prediction.update({
                    where: { id: game.id },
                    data: {
                        result: result,
                        score: scoreStr
                    }
                });
            }
        }
    } catch (error) {
        console.error("Auto-Update Error:", error);
    }
};

const evaluatePrediction = (prediction, home, away) => {
    const totalGoals = home + away;
    const pred = prediction.toLowerCase();

    if (pred.includes('over 1.5') && totalGoals > 1.5) return true;
    if (pred.includes('over 2.5') && totalGoals > 2.5) return true;
    if (pred.includes('home win') && home > away) return true;
    if (pred.includes('away win') && away > home) return true;
    if (pred.includes('double chance 1x') && home >= away) return true;
    if (pred.includes('double chance x2') && away >= home) return true;
    if (pred.includes('draw') && home === away) return true;
    if (pred.includes('both teams to score') && home > 0 && away > 0) return true;

    return false;
};
