
// Scripts/check_rapidapi.js
// import fetch from 'node-fetch'; // Native Node 18+

// I'll use the key from footballApi.js (hardcoded for test)
// I'll use the key from footballApi.js (hardcoded for test)
const API_KEY = process.env.API_FOOTBALL_KEY;
const HOST = "api-football-v1.p.rapidapi.com";

const checkOdds = async () => {
    // 1. Get Fixture ID for a big game (e.g. Man City)
    console.log("1️⃣ Searching for fixtures on 2026-01-14...");
    const url = `https://${HOST}/v3/fixtures?date=2026-01-14`; // Specific date

    const res = await fetch(url, {
        headers: {
            "x-rapidapi-key": API_KEY,
            "x-rapidapi-host": HOST
        }
    });

    const data = await res.json();
    if (!data.response || data.response.length === 0) {
        console.log("❌ No match found. Response:", JSON.stringify(data, null, 2));
        return;
    }

    const fixture = data.response[0];
    const fixtureId = fixture.fixture.id;
    console.log(`✅ Found Match: ${fixture.teams.home.name} vs ${fixture.teams.away.name} (ID: ${fixtureId})`);

    // 2. Get Odds
    console.log(`2️⃣ Fetching Odds for ID: ${fixtureId}...`);
    const oddsUrl = `https://${HOST}/v3/odds?fixture=${fixtureId}`;
    const oddsRes = await fetch(oddsUrl, {
        headers: {
            "x-rapidapi-key": API_KEY,
            "x-rapidapi-host": HOST
        }
    });

    const oddsData = await oddsRes.json();
    if (!oddsData.response || oddsData.response.length === 0) {
        console.log("⚠️ No odds available for this match yet.");
    } else {
        const bookmakers = oddsData.response[0].bookmakers;
        const mainBookie = bookmakers.find(b => b.id === 6) || bookmakers[0]; // 6 = Bwin, or take first
        console.log(`✅ Odds Found (${mainBookie.name}):`);
        const market = mainBookie.bets.find(b => b.id === 1); // 1 = Winner
        if (market) {
            market.values.forEach(v => console.log(`   ${v.value}: ${v.odd}`));
        }
    }
};

checkOdds();
