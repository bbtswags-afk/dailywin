
import fs from 'fs';

const STAGE_ID = "21997"; // Premier League from previous dump
const URL = `https://prod-public-api.livescore.com/v1/api/app/stage/soccer/${STAGE_ID}/standing?locale=en`;

const testScrape = async () => {
    try {
        console.log(`Probing Table: ${URL}`);
        const res = await fetch(URL, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://www.livescore.com/"
            }
        });

        console.log(`Status: ${res.status}`);
        if (res.ok) {
            const data = await res.json();
            console.log("SUCCESS! Root Keys:", Object.keys(data));
            if (data.Stages && data.Stages[0].Adj) {
                console.log("Found Standing Table!");
                // Check first team for Form
                const table = data.Stages[0].Adj;
                // Actually structure might be Stages[0].LeagueTable.L[0].Tables[0].team...
                // Let's dump it.
            }
            fs.writeFileSync('dump_table.json', JSON.stringify(data, null, 2));
            console.log("Saved to dump_table.json");
        }
    } catch (e) {
        console.log("Failed:", e.message);
    }
};

testScrape();
