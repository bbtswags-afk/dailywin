import fetch from 'node-fetch';
import { getTrueDate } from "./timeService.js";

const RAPID_API_KEY = process.env.RAPID_API_KEY;
const BASE_URL = 'https://api-football-v1.p.rapidapi.com/v3';

const headers = {
    'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
    'x-rapidapi-key': RAPID_API_KEY
};

// Helper: Delay to be safe (Rate limit is usually 10/sec, so 200ms sleep is plenty safe)
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Global Cache for the day's fixtures (to avoid hitting API 15 times)
let TODAYS_FIXTURES_CACHE = [];
let CACHE_DATE = null;

/**
 * Fetch ALL fixtures for a specific date (1 Request = 100+ matches)
 * This is much smarter than searching team-by-team.
 */
const ensureDailyCache = async () => {
    try {
        const todayFn = await getTrueDate();
        const dateStr = todayFn.toISOString().split('T')[0];

        if (CACHE_DATE === dateStr && TODAYS_FIXTURES_CACHE.length > 0) {
            return; // Cache hit
        }

        console.log(`🌍 RapidAPI: Pre - fetching ALL fixtures for ${dateStr}...`);
        const url = `${BASE_URL}/fixtures?date=${dateStr}`;
        const res = await fetch(url, { headers });
        const data = await res.json();

        if (data.response) {
            TODAYS_FIXTURES_CACHE = data.response;
            CACHE_DATE = dateStr;
            console.log(`   -> Cached ${data.response.length} matches from RapidAPI.`);
        }

    } catch (e) {
        console.error("RapidAPI Cache Error:", e.message);
    }
};

/**
 * Fuzzy Matcher to link LiveScore names to RapidAPI names.
 * e.g. "R. Oviedo" -> "Real Oviedo"
 */
const findMatchInCache = (homeName, awayName) => {
    if (!TODAYS_FIXTURES_CACHE.length) return null;

    // Normalize: remove generic FC, spaces, lowercase
    const norm = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

    const h = norm(homeName);
    const a = norm(awayName);

    // Strict(ish) check
    return TODAYS_FIXTURES_CACHE.find(f => {
        const apiHome = norm(f.teams.home.name);
        const apiAway = norm(f.teams.away.name);

        // Check exact includes (handles "Man City" vs "Manchester City")
        const homeMatch = apiHome.includes(h) || h.includes(apiHome);
        const awayMatch = apiAway.includes(a) || a.includes(apiAway);

        return homeMatch && awayMatch;
    });
};

/**
 * Get H2H and Form Data using the Cached Match ID
 */
export const getH2H_Rapid = async (homeTeamName, awayTeamName) => {
    try {
        // 1. Ensure we have the day's ID list
        await ensureDailyCache();

        // 2. Find the match
        const rapidMatch = findMatchInCache(homeTeamName, awayTeamName);

        if (!rapidMatch) {
            console.log(`   -> RapidAPI: Could not match "${homeTeamName} vs ${awayTeamName}" in daily list.`);
            // fallback: maybe they spelled it wildly different?
            return null;
        }

        const fixtureId = rapidMatch.fixture.id;
        const homeId = rapidMatch.teams.home.id;
        const awayId = rapidMatch.teams.away.id;

        console.log(`   -> ✅ Found in RapidAPI: ID ${fixtureId} (${rapidMatch.teams.home.name} vs ${rapidMatch.teams.away.name})`);

        // 3. Get H2H (1 Request)
        const url = `${BASE_URL}/fixtures/headtohead?h2h=${homeId}-${awayId}&last=10`;
        const res = await fetch(url, { headers });
        const data = await res.json();

        const matches = data.response || [];

        // Process H2H
        let h2hText = [];
        matches.slice(0, 5).forEach(m => {
            const score = `${m.goals.home}-${m.goals.away}`;
            const winner = m.teams.home.winner ? m.teams.home.name : (m.teams.away.winner ? m.teams.away.name : "Draw");
            h2hText.push(`${new Date(m.fixture.date).toISOString().split('T')[0]}: ${m.teams.home.name} ${score} ${m.teams.away.name} (${winner})`);
        });

        // 4. Get Form (2 Requests - OPTIONAL if running low on credits)
        // Since we are caching the main list, we can 'afford' these 2 calls.
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
            return `${wdl} ${myGoals}-${oppGoals}`;
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
