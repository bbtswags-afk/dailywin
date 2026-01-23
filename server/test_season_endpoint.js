
import fetch from 'node-fetch';

const checkSeason = async () => {
    // 1. Search specific event to find Season String
    const query = "Barcelona vs Real Madrid";
    console.log(`🔎 Analyzing Event: ${query}...`);
    const searchUrl = `https://www.thesportsdb.com/api/v1/json/3/searchevents.php?e=${encodeURIComponent(query)}`;
    const res = await fetch(searchUrl);
    const data = await res.json();

    if (data.event) {
        // Find 2026 match
        const match = data.event.find(e => e.dateEvent.startsWith('2026'));
        if (match) {
            console.log(`✅ Found Match JSON: ${match.strEvent} (${match.dateEvent})`);
            console.log(`   - Season: ${match.strSeason}`);
            console.log(`   - League: ${match.strLeague} (ID: ${match.idLeague})`);
        } else {
            console.log("   - Match not found in search results (2026 filter).");
        }
    }

    // 2. Try Fetching Last Events for Team via eventslast.php again
    console.log(`\n🔎 Re-checking 'eventslast.php' for Real Madrid (133738)...`);
    const lastUrl = `https://www.thesportsdb.com/api/v1/json/3/eventslast.php?id=133738`;
    const lastRes = await fetch(lastUrl);
    const lastData = await lastRes.json();
    console.log(`   - Count: ${lastData.results ? lastData.results.length : 0}`);
    if (lastData.results) {
        lastData.results.forEach(e => console.log(`     - ${e.dateEvent} [${e.strLeague}] (${e.intHomeScore}-${e.intAwayScore})`));
    }
};

checkSeason();
