
// Scripts/debug_livescore.js
// import fetch from 'node-fetch'; // Native fetch in Node 18+

const getRawLiveScoreData = async () => {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
    const url = `https://prod-public-api.livescore.com/v1/api/app/date/soccer/${today}/0?locale=en&MD=1`;
    console.log(`Fetching: ${url}`);

    const res = await fetch(url);
    const data = await res.json();

    if (data.Stages && data.Stages.length > 0) {
        // Find a stage with events
        const stage = data.Stages.find(s => s.Events && s.Events.length > 0 && (s.Snm === 'Premier League' || s.Snm === 'LaLiga' || s.Cnm === 'England'));

        if (stage) {
            console.log(`\n--- Match Found: ${stage.Snm} (${stage.Cnm}) ---`);
            const evt = stage.Events[0];
            console.log("Event Keys:", Object.keys(evt));
            console.log("Full Event Object:", JSON.stringify(evt, null, 2));
        } else {
            console.log("No major league matches found to inspect. printing first available.");
            const first = data.Stages[0].Events[0];
            console.log(JSON.stringify(first, null, 2));
        }
    } else {
        console.log("No data found.");
    }
};

getRawLiveScoreData();
