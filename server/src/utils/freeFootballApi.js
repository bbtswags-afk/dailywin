
const API_KEY = "882739454cf94227a875e6c517e24165"; // Provided by user
const BASE_URL = "http://api.football-data.org/v4";

const headers = { 'X-Auth-Token': API_KEY };

// Mappings for League IDs in Football-Data.org
const LEAGUE_MAP = {
    'Premier League': 'PL',
    'Championship': 'ELC',
    'UEFA Champions League': 'CL',
    'Bundesliga': 'BL1',
    'Serie A': 'SA',
    'Ligue 1': 'FL1',
    'La Liga': 'PD',
    'Primera Division': 'PD',
    'Eredivisie': 'DED',
    'Primeira Liga': 'PPL',
    'Serie A (Brazil)': 'BSA'
};

export const searchTeamFree = async (teamName) => {
    return null;
};

export const getH2HFree = async (homeName, awayName, leagueName = "") => {
    // SINCE searching ID is hard, we can search MATCHES for these teams.
    // Endpoint: /matches?head2head={id} requires ID.
    // To get IDs, we need to find the team first.

    // Strategy: 
    // 1. We know the match is happening TODAY.
    // 2. Fetch "Today's Matches" from Football-Data.org.
    // 3. Find the one matching Home/Away names.
    // 4. That Match Object contains team IDs.
    // 5. Use those IDs to call /teams/{id}/matches?status=FINISHED (Form) or /matches (H2H).

    console.log(`🆓 FreeAPI: Looking up match for ${homeName} vs ${awayName} (${leagueName})`);
    try {
        // Expand search window +/- 1 day to handle timezone diffs
        const now = new Date();
        const yest = new Date(now); yest.setDate(yest.getDate() - 1);
        const tom = new Date(now); tom.setDate(tom.getDate() + 1);

        const d1 = yest.toISOString().split('T')[0];
        const d2 = tom.toISOString().split('T')[0];

        const url = `${BASE_URL}/matches?dateFrom=${d1}&dateTo=${d2}`;

        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error(`Status ${res.status}`);

        const data = await res.json();
        const matches = data.matches || [];
        console.log(`   -> FreeAPI: Fetched ${matches.length} matches in window.`);

        // Fuzzy Match
        const match = matches.find(m =>
            (m.homeTeam.name.includes(homeName) || homeName.includes(m.homeTeam.name)) &&
            (m.awayTeam.name.includes(awayName) || awayName.includes(m.awayTeam.name))
        );

        // Map league name to code (for logging only now)
        const leagueCode = LEAGUE_MAP[leagueName] || null;
        if (leagueCode) console.log(`   -> League Filter Identified: ${leagueCode}`);

        if (match) {
            console.log(`   -> Found Match ID: ${match.id} (Teams: ${match.homeTeam.id}/${match.awayTeam.id})`);
            return await getDetailH2H(match.homeTeam.id, match.awayTeam.id, leagueCode);
        } else {
            console.log("   -> Match not found in Football-Data.org schedule (Coverage limit?)");
            return null;
        }

    } catch (e) {
        console.error("FreeAPI Error:", e.message);
        return null;
    }
};

const getDetailH2H = async (homeId, awayId, leagueCode) => {
    // Fetch H2H explicitly using the endpoint /persons/{id}/matches? No.
    // Actually, simply fetching the teams' last 5 matches is best for "Form".

    // Fetch Home Team's last 50 matches (for H2H) and Away's last 50 (for Form)
    const [homeRes, awayRes] = await Promise.all([
        fetch(`${BASE_URL}/teams/${homeId}/matches?status=FINISHED&limit=50`, { headers }),
        fetch(`${BASE_URL}/teams/${awayId}/matches?status=FINISHED&limit=50`, { headers })
    ]);

    const homeData = await homeRes.json();
    const awayData = await awayRes.json();

    let homeMatches = (homeData.matches || []).reverse(); // Newest first
    let awayMatches = (awayData.matches || []).reverse(); // Newest first

    // FILTER BY LEAGUE (Disabled to show Global Form)
    if (leagueCode) {
        // Strict League Filtering DISABLED (User Request: "Not only league games").
        console.log(`   -> Global Form Used (ignoring league filter ${leagueCode}) to capture Cup momentum.`);
    }

    console.log(`Debug H2H: HomeID=${homeId}, AwayID=${awayId}. Scanning ${homeMatches.length} matches.`);
    if (homeMatches.length > 0) {
        // Safe access
        const m = homeMatches[0];
        console.log(`   Sample Match: ${m.homeTeam.name} vs ${m.awayTeam.name} (${m.utcDate})`);
    }

    // 1. True H2H Filtering (Optional per user req, but kept for context)
    const h2hMatches = homeMatches.filter(m =>
        m.homeTeam.id === awayId || m.awayTeam.id === awayId
    );
    console.log(`   Found ${h2hMatches.length} H2H matches.`);

    // Format H2H (Take last 5 encounters)
    const h2hStrings = h2hMatches.slice(0, 5).map(m =>
        `${m.homeTeam.shortName} ${m.score.fullTime.home}-${m.score.fullTime.away} ${m.awayTeam.shortName}`
    ).join('; ');

    // 2. Form (Last 5 Games) & Goal Stats
    const homeRecent = homeMatches.slice(0, 5);
    const awayRecent = awayMatches.slice(0, 5);

    const calcStats = (matches, teamId) => {
        let scored = 0;
        let conceded = 0;
        const form = matches.map(m => {
            const isHome = m.homeTeam.id === teamId;
            const goalsFor = isHome ? m.score.fullTime.home : m.score.fullTime.away;
            const goalsAgainst = isHome ? m.score.fullTime.away : m.score.fullTime.home;
            scored += goalsFor; // Accumulate goals
            conceded += goalsAgainst;
            return labelResult(m, teamId);
        }).join('');
        return { form, scored, conceded, matchCount: matches.length };
    };

    const homeStats = calcStats(homeRecent, homeId);
    const awayStats = calcStats(awayRecent, awayId);

    return {
        h2h: h2hStrings || "N/A",
        homeForm: homeStats.form,
        awayForm: awayStats.form,
        homeStats, // Enriched Context
        awayStats
    };
};

const labelResult = (match, teamId) => {
    const winner = match.score.winner; // HOME_TEAM, AWAY_TEAM, DRAW
    if (winner === 'DRAW') return 'D';
    if (winner === 'HOME_TEAM' && match.homeTeam.id === teamId) return 'W';
    if (winner === 'AWAY_TEAM' && match.awayTeam.id === teamId) return 'W';
    return 'L';
};
