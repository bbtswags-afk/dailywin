import fetch from 'node-fetch';

const RAPID_API_KEY = process.env.RAPID_API_KEY;
const BASE_URL = 'https://api-football-v1.p.rapidapi.com/v3';

const headers = {
    'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
    'x-rapidapi-key': RAPID_API_KEY
};

// Helper: Delay to be safe (Rate limit is usually 10/sec, so 200ms sleep is plenty safe)
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/**
 * Search for a team by name to get its ID (API-Football specific)
 */
export const searchTeam_Rapid = async (teamName) => {
    try {
        const url = `${BASE_URL}/teams?name=${encodeURIComponent(teamName)}`;
        const res = await fetch(url, { headers });
        const data = await res.json();

        if (data.response && data.response.length > 0) {
            return data.response[0].team.id;
        }
        return null;
    } catch (error) {
        console.error("RapidAPI Search Error:", error.message);
        return null;
    }
};

/**
 * Get H2H and Form Data between two teams
 * Uses the '/fixtures/headtohead' endpoint which returns past matches.
 */
export const getH2H_Rapid = async (homeTeamName, awayTeamName) => {
    try {
        // 1. We need Team IDs first. 
        // Note: In a production app, we would map these IDs once and store them.
        // For now, we search. This "costs" requests, so be careful.
        // OPTIMIZATION: If we passed IDs from LiveScore mappings, we'd save calls.

        // For now, let's assume valid search. 
        // NOTE: This logic is expensive (2 searches + 1 h2h = 3 requests per match).
        // WE SHOULD TRY TO FIND THE MATCH BY FIXTURE ID IF POSSIBLE, 
        // but our LiveScore source doesn't have RapidAPI IDs.

        const homeId = await searchTeam_Rapid(homeTeamName);
        const awayId = await searchTeam_Rapid(awayTeamName);

        if (!homeId || !awayId) {
            console.log(`   -> RapidAPI: Could not resolve IDs for ${homeTeamName} or ${awayTeamName}`);
            return null;
        }

        const url = `${BASE_URL}/fixtures/headtohead?h2h=${homeId}-${awayId}&last=10`;
        const res = await fetch(url, { headers });
        const data = await res.json();

        if (!data.response) return null;

        const matches = data.response;

        // Process H2H
        let h2hText = [];
        let homeWins = 0;
        let awayWins = 0;

        matches.slice(0, 5).forEach(m => {
            const score = `${m.goals.home}-${m.goals.away}`;
            const winner = m.teams.home.winner ? m.teams.home.name : (m.teams.away.winner ? m.teams.away.name : "Draw");
            h2hText.push(`${new Date(m.fixture.date).toISOString().split('T')[0]}: ${m.teams.home.name} ${score} ${m.teams.away.name} (${winner})`);

            if (m.teams.home.id === homeId && m.teams.home.winner) homeWins++;
            if (m.teams.away.id === homeId && m.teams.away.winner) homeWins++; // As away team

            if (m.teams.home.id === awayId && m.teams.home.winner) awayWins++;
            if (m.teams.away.id === awayId && m.teams.away.winner) awayWins++;
        });

        // Get Team Statistics (Last 5 Games Form)
        // We can infer form from H2H if they played recently, but better to fetch form specific?
        // Actually, 'fixtures?team=ID&last=5' is a separate call.
        // To save requests, let's calculate simplistic form from the H2H if they played each other,
        // BUT reality is we need their individual form against *anyone*.

        // Let's do 2 more calls for form. Total 5 requests per match? Too expensive for 100 limit.
        // 100 requests / 5 = 20 matches. It fits! 

        const homeForm = await getTeamForm(homeId);
        const awayForm = await getTeamForm(awayId);

        return {
            h2h: h2hText.join(". ") || "No recent meetings.",
            homeForm: homeForm.text,
            awayForm: awayForm.text,
            homeStats: homeForm.stats,
            awayStats: awayForm.stats,
            ids: { home: homeId, away: awayId }
        };

    } catch (error) {
        console.error("RapidAPI H2H Error:", error.message);
        return null;
    }
};

const getTeamForm = async (teamId) => {
    try {
        const url = `${BASE_URL}/fixtures?team=${teamId}&last=5&status=FT`; // Last 5 Finished games
        const res = await fetch(url, { headers });
        const data = await res.json();

        if (!data.response) return { text: "N/A", stats: {} };

        const games = data.response;
        const results = games.map(g => {
            const isHome = g.teams.home.id === teamId;
            const myGoals = isHome ? g.goals.home : g.goals.away;
            const oppGoals = isHome ? g.goals.away : g.goals.home;
            const wdl = myGoals > oppGoals ? "W" : (myGoals === oppGoals ? "D" : "L");
            return `${wdl} ${myGoals}-${oppGoals} vs ${isHome ? g.teams.away.name : g.teams.home.name}`;
        });

        // Calc Stats
        let scored = 0;
        let conceded = 0;
        games.forEach(g => {
            const isHome = g.teams.home.id === teamId;
            scored += (isHome ? g.goals.home : g.goals.away);
            conceded += (isHome ? g.goals.away : g.goals.home);
        });

        return {
            text: results.join(", "),
            stats: {
                scored: scored,
                conceded: conceded,
                detailed: results
            }
        };

    } catch (e) {
        return { text: "N/A", stats: {} };
    }
};
