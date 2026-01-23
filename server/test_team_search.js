
import fetch from 'node-fetch';

const checkSearch = async () => {
    const query = "Real Madrid";
    console.log(`🔎 Searching Events for query: "${query}"...`);
    const url = `https://www.thesportsdb.com/api/v1/json/3/searchevents.php?e=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.event) {
        console.log("❌ No events found.");
        return;
    }

    console.log(`✅ Found ${data.event.length} events.`);

    // Sort descending by date
    const sorted = data.event.sort((a, b) => b.dateEvent.localeCompare(a.dateEvent));

    console.log("\n--- Top 10 Search Results (Most Recent) ---");
    sorted.slice(0, 10).forEach(e => {
        console.log(`${e.dateEvent}: ${e.strEvent} [${e.strLeague}] (${e.intHomeScore}-${e.intAwayScore})`);
    });
};

checkSearch();
