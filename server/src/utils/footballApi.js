// import fetch from 'node-fetch'; // Native fetch is available in Node 18+

const API_HOST = 'api-football-v1.p.rapidapi.com';
const BASE_URL = `https://${API_HOST}/v3`;

// Key Rotation Logic
const distinctKeys = (process.env.API_FOOTBALL_KEY || '').split(',').map(k => k.trim()).filter(k => k);
let currentKeyIndex = 0;

const getHeaders = () => ({
    'x-rapidapi-key': distinctKeys[currentKeyIndex],
    'x-rapidapi-host': API_HOST
});

const cache = new Map();
const CACHE_TTL_SECONDS = 300;

const fetchAPI = async (endpoint, retryCount = 0) => {
    // 1. Check Cache (Only on first attempt)
    if (retryCount === 0) {
        const cached = cache.get(endpoint);
        const now = Date.now();
        if (cached && (now - cached.timestamp < CACHE_TTL_SECONDS * 1000)) {
            console.log(`⚡ Serving from Cache: ${endpoint}`);
            return cached.data;
        }
    }

    if (distinctKeys.length === 0) return { response: [] };

    try {
        console.log(`🌐 Fetching from API (Key #${currentKeyIndex + 1}): ${endpoint}`);
        const response = await fetch(`${BASE_URL}${endpoint}`, { headers: getHeaders() });

        // 2. Handle HTTP Errors (429, 403, 401)
        if (response.status === 429 || response.status === 403 || response.status === 401) {
            console.warn(`⚠️ Key #${currentKeyIndex + 1} Status Error (${response.status}). Rotating...`);
            return rotateKey(endpoint, retryCount);
        }

        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

        const data = await response.json();

        // Debug Log
        if (!data.response || data.response.length === 0) {
            console.log(`⚠️ API Returned Empty/Error for ${endpoint}:`, JSON.stringify(data));
        }

        // 3. Handle Logical API Errors (200 OK but "errors" object present)
        // API-Football returns "errors": [] (empty array) when good, or object/array when bad.
        // Or "errors": { "token": "..." }
        const hasErrors = data.errors && (Array.isArray(data.errors) ? data.errors.length > 0 : Object.keys(data.errors).length > 0);

        if (hasErrors) {
            console.warn(`⚠️ Key #${currentKeyIndex + 1} returned Logical Errors:`, JSON.stringify(data.errors));
            return rotateKey(endpoint, retryCount);
        }

        // Cache if valid
        if (data.response) {
            cache.set(endpoint, {
                timestamp: Date.now(),
                data: data
            });
        }

        return data;
    } catch (error) {
        console.error(`Failed to fetch ${endpoint}:`, error);
        return cache.get(endpoint)?.data || { response: [] };
    }
};

const rotateKey = (endpoint, retryCount) => {
    if (retryCount >= distinctKeys.length) {
        console.error("❌ All API Keys exhausted or failed.");
        return { response: [], errors: { rateLimit: "All Keys Failed" } };
    }
    currentKeyIndex = (currentKeyIndex + 1) % distinctKeys.length;
    return fetchAPI(endpoint, retryCount + 1);
};

export const getDailyFixtures = async () => {
    // Check for Manual Date Override (for Testing/Development)
    const overrideDate = process.env.OVERRIDE_DATE;
    const dateObj = overrideDate ? new Date(overrideDate) : new Date();
    const dateStr = dateObj.toISOString().split('T')[0];
    console.log(`📅 getDailyFixtures using Date: ${dateStr} (Override: ${overrideDate})`);

    return fetchAPI(`/fixtures?date=${dateStr}`);
};

export const getFixtureLineups = async (fixtureId) => {
    return fetchAPI(`/fixtures/lineups?fixture=${fixtureId}`);
};

export const getHeadToHead = async (homeId, awayId) => {
    return fetchAPI(`/fixtures/headtohead?h2h=${homeId}-${awayId}&last=5`);
};

export const getLeagueStandings = async (leagueId, season) => {
    const currentYear = new Date().getFullYear();
    const year = season || (new Date().getMonth() < 6 ? currentYear - 1 : currentYear);
    return fetchAPI(`/standings?league=${leagueId}&season=${year}`);
};

export const getFixtureDetails = async (fixtureId) => {
    return fetchAPI(`/fixtures?id=${fixtureId}`);
};

export const searchTeam = async (name) => {
    // Basic caching or logic to handle "Arsenal" -> "Arsenal FC" mismatch might be needed.
    // API-Football is fuzzy, usually works.
    return fetchAPI(`/teams?search=${encodeURIComponent(name)}`);
};

export const getLiveScores = async () => {
    // ... existing live score logic ...
    // (Ensure this isn't lost)
    try {
        console.log("⚽ Fetching Live Scores from LiveScore.com...");
        const response = await fetch('https://prod-public-api.livescore.com/v1/api/app/live/soccer/0?locale=en&MD=1', { headers: { 'User-Agent': 'Mozilla/5.0' } });
        // ... (Simpler to just leave getLiveScores alone and ADD getScrapedDailyFixtures below it, but the tool requires replacing)
        if (!response.ok) throw new Error('LiveScore API Failed');
        const data = await response.json();
        const mappedMatches = [];

        if (data.Stages) {
            data.Stages.forEach(stage => {
                const mapId = getLeagueId(stage.Snm, stage.Cnm);
                if (!mapId) return;
                stage.Events.forEach(evt => {
                    mappedMatches.push(mapLiveScoreEvent(evt, stage.Snm, stage.Cnm, mapId));
                });
            });
        }
        console.log(`✅ Mapped ${mappedMatches.length} Live Games.`);
        return { response: mappedMatches };
    } catch (e) {
        console.error("Scraper Error:", e);
        return { response: [] };
    }
};

// Helper to map League Names to IDs
const getLeagueId = (name, country) => {
    const n = (name + " " + country).toLowerCase();

    // England
    if (n.includes("premier league") && n.includes("england")) return 39;
    if (n.includes("championship") && n.includes("england")) return 40;
    if (n.includes("league one") && n.includes("england")) return 41;
    if (n.includes("fa cup")) return 45;
    if (n.includes("carabao") || n.includes("efl cup")) return 48;

    // Spain
    if ((n.includes("laliga") || n.includes("la liga") || n.includes("primera")) && n.includes("spain")) return 140;
    if ((n.includes("segunda") || n.includes("laliga 2") || n.includes("hypermotion")) && n.includes("spain")) return 141;
    if (n.includes("copa del rey")) return 143;

    // Germany
    if (n.includes("bundesliga") && n.includes("germany")) return 78;
    if (n.includes("2. bundesliga") || (n.includes("bundesliga 2"))) return 79;
    if (n.includes("dfb pokal")) return 81;

    // Italy
    if (n.includes("serie a") && n.includes("italy")) return 135;
    if (n.includes("serie b") && n.includes("italy")) return 136;
    if (n.includes("coppa italia")) return 137;

    // France
    if (n.includes("ligue 1") && n.includes("france")) return 61;
    if (n.includes("ligue 2") && n.includes("france")) return 62;
    if (n.includes("coupe de france")) return 66;

    // Others
    if (n.includes("champions league")) return 2;
    if (n.includes("europa league")) return 3;
    if (n.includes("eredivisie")) return 88;
    if (n.includes("primeira") || n.includes("liga portugal")) return 94;

    return 0; // Filter out unknown leagues to ensure data quality
};

// Helper to map Event
const mapLiveScoreEvent = (evt, leagueName, country, leagueId) => ({
    fixture: {
        id: evt.Eid,
        status: { short: "LIVE", elapsed: evt.Eps },
        date: new Date().toISOString()
    },
    league: {
        id: leagueId || 0,
        name: leagueName,
        country: country,
        logo: leagueId ? `https://media.api-sports.io/football/leagues/${leagueId}.png` : ""
    },
    teams: {
        home: { name: evt.T1[0].Nm, logo: "https://lsm-static-prod.livescore.com/medium/" + evt.T1[0].Img },
        away: { name: evt.T2[0].Nm, logo: "https://lsm-static-prod.livescore.com/medium/" + evt.T2[0].Img }
    },
    goals: { home: evt.Tr1, away: evt.Tr2 },
    score: { fulltime: { home: evt.Tr1, away: evt.Tr2 } }
});


import { getTrueDate } from './timeService.js';

export const getScrapedDailyFixtures = async (optionalDateStr) => {
    try {
        // Handle Date (YYYYMMDD) - Use Online Time if override not present
        const overrideDate = process.env.OVERRIDE_DATE || optionalDateStr;
        let dateObj;

        if (overrideDate) {
            dateObj = new Date(overrideDate);
            console.log(`📅 Using Target Date: ${overrideDate}`);
        } else {
            dateObj = await getTrueDate();
            console.log(`📅 Using Online True Date: ${dateObj.toISOString()}`);
        }
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const dateParam = `${yyyy}${mm}${dd}`;

        console.log(`🕷️ Scraping Fixtures from LiveScore.com for date: ${dateParam}`);

        const url = `https://prod-public-api.livescore.com/v1/api/app/date/soccer/${dateParam}/0?locale=en&MD=1`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://www.livescore.com/'
            }
        });

        if (!response.ok) throw new Error('LiveScore Schedule API Failed');
        const data = await response.json();

        const mappedMatches = [];

        if (data.Stages) {
            data.Stages.forEach(stage => {
                const mapId = getLeagueId(stage.Snm, stage.Cnm);
                // Allow known leagues only to ensure prediction quality (and mapping)
                if (!mapId) return;

                stage.Events.forEach(evt => {
                    mappedMatches.push({
                        fixture: {
                            id: evt.Eid, // Use LS ID
                            date: dateObj.toISOString(), // Approximation
                            status: { short: "NS" } // Not Started
                        },
                        league: {
                            id: mapId,
                            name: stage.Snm,
                            country: stage.Cnm,
                            season: dateObj.getFullYear(),
                            logo: `https://media.api-sports.io/football/leagues/${mapId}.png`
                        },
                        teams: {
                            home: { name: evt.T1[0].Nm, id: 0, logo: "https://lsm-static-prod.livescore.com/medium/" + evt.T1[0].Img },
                            away: { name: evt.T2[0].Nm, id: 0, logo: "https://lsm-static-prod.livescore.com/medium/" + evt.T2[0].Img }
                        }
                    });
                });
            });
        }

        console.log(`✅ Scraped & Mapped ${mappedMatches.length} Fixtures.`);
        return { response: mappedMatches };

    } catch (e) {
        console.error("Scraper Error:", e);
        return { response: [] };
    }
};
