
const API_KEY = "882739454cf94227a875e6c517e24165";
const BASE_URL = "http://api.football-data.org/v4";
const headers = { 'X-Auth-Token': API_KEY };

async function check() {
    // Dortmund ID = 4
    const url = `${BASE_URL}/teams/4/matches?status=FINISHED&limit=15`;
    console.log("Fetching Borussia Dortmund (ID: 4) last 5 matches...");

    try {
        const res = await fetch(url, { headers });
        const data = await res.json();

        if (!data.matches) {
            console.log("Error: No matches found.", data);
            return;
        }

        const matches = data.matches.reverse().slice(0, 5);

        matches.forEach(m => {
            const isHome = m.homeTeam.id === 4;
            const opponent = isHome ? m.awayTeam.name : m.homeTeam.name;
            const myScore = isHome ? m.score.fullTime.home : m.score.fullTime.away;
            const oppScore = isHome ? m.score.fullTime.away : m.score.fullTime.home;

            let result = 'L';
            if (m.score.winner === 'DRAW') result = 'D';
            else if ((isHome && m.score.winner === 'HOME_TEAM') || (!isHome && m.score.winner === 'AWAY_TEAM')) result = 'W';

            console.log(`[${result}] ${m.utcDate.split('T')[0]} vs ${opponent} (${m.competition.name}) Score: ${m.score.fullTime.home}-${m.score.fullTime.away}`);
        });
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}
check();
