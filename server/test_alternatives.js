
const testAlternatives = async () => {
    console.log("--- Testing TheSportsDB (Free Test Key: 2) ---");
    try {
        // Search for Arsenal
        const searchUrl = "https://www.thesportsdb.com/api/v1/json/2/searchteams.php?t=Arsenal";
        const res = await fetch(searchUrl);
        const data = await res.json();
        if (data.teams) {
            console.log("✅ TheSportsDB: Found Arsenal (ID: " + data.teams[0].idTeam + ")");

            // Try Last 5 Events
            const eventsUrl = `https://www.thesportsdb.com/api/v1/json/2/eventslast.php?id=${data.teams[0].idTeam}`;
            const res2 = await fetch(eventsUrl);
            const data2 = await res2.json();
            if (data2.results) {
                console.log("✅ TheSportsDB: Found Recent Matches:");
                data2.results.forEach(m => console.log(`   ${m.strHomeTeam} ${m.intHomeScore}-${m.intAwayScore} ${m.strAwayTeam}`));
            } else {
                console.log("❌ TheSportsDB: No events found (Test Key limit?).");
            }
        }
    } catch (e) {
        console.log("❌ TheSportsDB Error:", e.message);
    }

    console.log("\n--- Testing Football-Data.org (No Key) ---");
    try {
        const url = "http://api.football-data.org/v4/competitions/PL/matches"; // Premier League
        const res = await fetch(url, {
            headers: { 'X-Auth-Token': '' } // Trying without token first
        });
        console.log(`Status: ${res.status}`);
        if (res.ok) {
            const data = await res.json();
            console.log("✅ Football-Data.org: Access Granted.");
            console.log(`   Matches Found: ${data.matches?.length}`);
        } else {
            console.log(`❌ Football-Data.org Error: ${res.status} ${res.statusText} (Likely needs Free Key)`);
        }
    } catch (e) {
        console.log("❌ Football-Data.org Error:", e.message);
    }
};

testAlternatives();
