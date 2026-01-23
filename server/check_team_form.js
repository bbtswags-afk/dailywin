
import fetch from 'node-fetch';

const searchTeam = async (name) => {
    const url = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(name)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.teams ? data.teams[0] : null;
};

const getForm = async (teamId) => {
    const url = `https://www.thesportsdb.com/api/v1/json/3/eventslast.php?id=${teamId}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.results) return "N/A";

    console.log("\n--- Last 5 Games Details ---");
    const form = data.results.map(e => {
        const homeScore = parseInt(e.intHomeScore);
        const awayScore = parseInt(e.intAwayScore);
        const isHome = e.idHomeTeam == teamId;

        let result = 'D';
        if (homeScore !== awayScore) {
            if (isHome) result = homeScore > awayScore ? 'W' : 'L';
            else result = awayScore > homeScore ? 'W' : 'L';
        }

        console.log(`${e.dateEvent}: ${e.strEvent} (${e.intHomeScore}-${e.intAwayScore}) -> ${result}`);
        return result;
    }).join('');

    return form;
};

const check = async () => {
    const team = "Real Madrid";
    console.log(`🔎 Searching for: ${team}`);

    const t = await searchTeam(team);
    if (!t) { console.log("Team not found"); return; }

    console.log(`✅ Found: ${t.strTeam} (ID: ${t.idTeam})`);

    const form = await getForm(t.idTeam);
    console.log(`\n📊 Form String: ${form}`);
};

check();
