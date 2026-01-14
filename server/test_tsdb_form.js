
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

    return data.results.map(e => {
        // Did this team win?
        // We need to check if they were home or away and compare scores
        const homeScore = parseInt(e.intHomeScore);
        const awayScore = parseInt(e.intAwayScore);
        const isHome = e.idHomeTeam == teamId;

        if (homeScore === awayScore) return 'D';
        if (isHome) return homeScore > awayScore ? 'W' : 'L';
        else return awayScore > homeScore ? 'W' : 'L';
    }).join('');
};

const test = async () => {
    const homeName = "Arsenal";
    const awayName = "Tottenham Hotspur"; // Try exact full name

    console.log(`Testing Form Fetch for ${homeName} vs ${awayName}...`);

    // Manual ID check for Arsenal since we know it exists (133604)
    console.log("Checking eventslast.php for Arsenal (133604)...");
    const testUrl = `https://www.thesportsdb.com/api/v1/json/3/eventslast.php?id=133604`;
    const res = await fetch(testUrl);
    const data = await res.json();
    console.log("Events Data:", data.results ? data.results.length : "None");
    if (data.results) {
        console.log("First Result:", data.results[0].strEvent, data.results[0].intHomeScore, "-", data.results[0].intAwayScore);
    }

    const t1 = await searchTeam(homeName);
    const t2 = await searchTeam(awayName);

    if (!t1 || !t2) {
        console.log("Failed to find teams.");
        return;
    }

    console.log(`Found: ${t1.strTeam} (${t1.idTeam}) vs ${t2.strTeam} (${t2.idTeam})`);

    const f1 = await getForm(t1.idTeam);
    const f2 = await getForm(t2.idTeam);

    console.log(`Home Form: ${f1}`);
    console.log(`Away Form: ${f2}`);
};

test();
