// src/lib/api/football.js
// Integration for API-Football via RapidAPI

const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY;
const API_HOST = 'api-football-v1.p.rapidapi.com';
const BASE_URL = `https://${API_HOST}/v3`;

const headers = {
    'x-rapidapi-key': API_KEY, // Changed from x-apisports-key
    'x-rapidapi-host': API_HOST
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getLiveScores = async () => {
    try {
        // Fetch from OUR Backend (Proxy) which handles Keys & Caching
        const response = await fetch(`${API_URL}/predictions/live`);
        if (!response.ok) throw new Error('Backend API Error');
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch live scores from backend:", error);
        return { response: [] };
    }
};

export const getDailyFixtures = async () => {
    try {
        const today = new Date().toISOString().split('T')[0];
        if (!API_KEY) return { response: [] };

        // Fetch mostly top leagues to save requests (Optional: add &league=39 for PL etc)
        // For now, let's fetch all and filter in frontend or let the AI pick
        const response = await fetch(`${BASE_URL}/fixtures?date=${today}`, { headers });
        if (!response.ok) throw new Error('API Error');

        return await response.json();
    } catch (error) {
        console.error("Failed to fetch fixtures:", error);
        return { response: [] };
    }
};

export const getFixtureLineups = async (fixtureId) => {
    try {
        if (!API_KEY) return { response: [] };
        const response = await fetch(`${BASE_URL}/fixtures/lineups?fixture=${fixtureId}`, { headers });
        if (!response.ok) throw new Error('API Error');
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch lineups:", error);
        return { response: [] };
    }
};

export const getFixtureStatistics = async (fixtureId) => {
    try {
        if (!API_KEY) return { response: [] };
        const response = await fetch(`${BASE_URL}/fixtures/statistics?fixture=${fixtureId}`, { headers });
        if (!response.ok) throw new Error('API Error');
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch statistics:", error);
        return { response: [] };
    }
};

export const getLeagueStandings = async (leagueId, season) => {
    try {
        if (!API_KEY) return { response: [] };
        // Default to current year if season not provided (simplified)
        const currentYear = new Date().getFullYear();
        const year = season || (new Date().getMonth() < 6 ? currentYear - 1 : currentYear);

        const response = await fetch(`${BASE_URL}/standings?league=${leagueId}&season=${year}`, { headers });
        if (!response.ok) throw new Error('API Error');
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch standings:", error);
        return { response: [] };
    }
};

export const getHeadToHead = async (homeId, awayId) => {
    try {
        if (!API_KEY) return { response: [] };
        const response = await fetch(`${BASE_URL}/fixtures/headtohead?h2h=${homeId}-${awayId}&last=5`, { headers });
        if (!response.ok) throw new Error('API Error');
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch H2H:", error);
        return { response: [] };
    }
};
