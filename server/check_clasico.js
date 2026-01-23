
import fetch from 'node-fetch';

const searchEvent = async (query) => {
    const url = `https://www.thesportsdb.com/api/v1/json/3/searchevents.php?e=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.event) {
        console.log(`\n✅ RESULTS FOR "${query}":`);
        data.event.forEach(e => {
            console.log(`   - ${e.dateEvent} | ${e.strEvent} (${e.intHomeScore}-${e.intAwayScore}) [${e.strLeague}]`);
        });
    } else {
        console.log(`\n❌ NO RESULTS FOR "${query}"`);
    }
};

const check = async () => {
    console.log("Searching for recent El Clasico...");
    await searchEvent("Real Madrid vs Barcelona");
    await searchEvent("Barcelona vs Real Madrid");
};

check();
