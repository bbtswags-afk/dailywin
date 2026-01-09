
import fs from 'fs';

const MATCH_ID = "1529025";
const URLS = [
    `https://prod-public-api.livescore.com/v1/api/app/match/soccer/${MATCH_ID}/content`,
    `https://prod-public-api.livescore.com/v1/api/app/match/soccer/${MATCH_ID}/3.0?locale=en`,
    `https://prod-public-api.livescore.com/v1/api/app/incidents/soccer/${MATCH_ID}`,
    `https://prod-public-api.livescore.com/v1/api/app/match/soccer/${MATCH_ID}/stats`
];

const testScrape = async () => {
    for (const url of URLS) {
        try {
            console.log(`\nProbing: ${url}`);
            const res = await fetch(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Referer": "https://www.livescore.com/"
                }
            });
            console.log(`Status: ${res.status}`);
            if (res.ok) {
                const data = await res.json();
                console.log("SUCCESS! Keys:", Object.keys(data));

                // Save specific success dump
                const name = url.split('/').pop().replace(/[^a-z0-9]/gi, '_');
                fs.writeFileSync(`dump_${name}.json`, JSON.stringify(data, null, 2));

                // Inspect for H2H
                if (data.h2h || data.headToHead) console.log(">>> FOUND H2H!");
                if (data.form || data.Form) console.log(">>> FOUND FORM!");
            }
        } catch (e) {
            console.log("Failed:", e.message);
        }
    }
};

testScrape();
