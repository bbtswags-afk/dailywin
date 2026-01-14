import fetch from 'node-fetch';

const API_KEY = process.env.THESPORTSDB_KEY || "3"; // Default to Test Key
const BASE_URL = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;

// Helper: Delay to be nice to the free API
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/**
 * Fuzzy Search for a Team to get its ID.
 */
export const searchTeam = async (teamName) => {
    try {
        // Clean name for better search (e.g. "Man City" -> "Manchester City" handled by DB often, but "Arsenal FC" -> "Arsenal")
        // TheSportsDB is decent at fuzzy, but let's try direct first.
        const url = `${BASE_URL}/searchteams.php?t=${encodeURIComponent(teamName)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.teams && data.teams.length > 0) {
            return data.teams[0];
        }
        return null;
    } catch (e) {
        console.error(`TSDB Search Error (${teamName}):`, e.message);
        return null;
    }
};

/**
 * Get H2H and Form Data for AI Context.
 * Hybrid Update: 
 * - H2H: Via 'searchevents.php' (Unlimited).
 * - Form: Via Scraper (implemented in scraperService, but here we focus on H2H).
 */
export const getH2H_TSDB = async (homeName, awayName) => {
    try {
        console.log(`🦕 TSDB: Looking up H2H for "${homeName}" vs "${awayName}"`);

        // Use the Search Event endpoint which is UNLIMITED (unlike eventslast.php)
        // Format: Team1_vs_Team2
        const query = `${homeName}_vs_${awayName}`;
        const url = `${BASE_URL}/searchevents.php?e=${encodeURIComponent(query)}`;

        const res = await fetch(url);
        const data = await res.json();

        let h2hText = "No recent meetings found.";

        let homeLogo = null;
        let awayLogo = null;

        // Check exact matches
        if (data.event && data.event.length > 0) {
            // Sort by date descending just in case
            const events = data.event.sort((a, b) => b.dateEvent.localeCompare(a.dateEvent));
            const recent = events.slice(0, 5); // Take last 5 meetings

            // Get Logos from the most recent event (most likely to be up to date)
            homeLogo = events[0].strHomeTeamBadge || null;
            awayLogo = events[0].strAwayTeamBadge || null;

            h2hText = recent.map(e => `${e.dateEvent}: ${e.strEvent} (${e.intHomeScore}-${e.intAwayScore})`).join('\n');
            console.log(`   -> ✅ Found ${events.length} past meetings.`);
        } else {
            console.log("   -> ⚠️ No H2H found via Search.");
        }

        return {
            h2h: h2hText,
            homeLogo,
            awayLogo,
            // Form is now handled by the Scraper, so we return nulls here to indicate "Go Fetch Form Elsewhere"
            ids: { home: null, away: null }
        };

    } catch (e) {
        console.error("TSDB H2H Error:", e.message);
        return null;
    }
};

/**
 * Get Last 5 Form string (e.g. "WWLDW") for a team ID.
 */
const fetchLast5 = async (teamId) => {
    try {
        const url = `${BASE_URL}/eventslast.php?id=${teamId}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data.results) return "N/A";

        // TSDB returns [Most Recent, ..., Oldest]
        return data.results.map(e => {
            const homeScore = parseInt(e.intHomeScore);
            const awayScore = parseInt(e.intAwayScore);
            const isHome = e.idHomeTeam == teamId;

            if (homeScore === awayScore) return 'D';
            if (isHome) return homeScore > awayScore ? 'W' : 'L';
            else return awayScore > homeScore ? 'W' : 'L';
        }).join('');
    } catch (e) {
        return "N/A";
    }
};

/**
 * Main function to get form for both teams.
 */
export const getForm_TSDB = async (homeName, awayName) => {
    try {
        console.log(`🦕 TSDB: Fetching Form for "${homeName}" vs "${awayName}"`);

        // 1. Find IDs
        const [homeTeam, awayTeam] = await Promise.all([
            searchTeam(homeName),
            searchTeam(awayName)
        ]);

        if (!homeTeam || !awayTeam) {
            console.log("   -> ⚠️ Failed to identify one or both teams in TSDB.");
            return { homeForm: "N/A", awayForm: "N/A" };
        }

        // 2. Fetch Form
        const [homeForm, awayForm] = await Promise.all([
            fetchLast5(homeTeam.idTeam),
            fetchLast5(awayTeam.idTeam)
        ]);

        console.log(`   -> ✅ Form Acquired (TSDB): ${homeForm} vs ${awayForm}`);
        return { homeForm, awayForm };

    } catch (e) {
        console.error("TSDB Form Error:", e.message);
        return { homeForm: "N/A", awayForm: "N/A" };
    }
};
