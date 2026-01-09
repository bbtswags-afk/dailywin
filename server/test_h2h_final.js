
import fs from 'fs';

const MATCH_ID = "1529025";
const URLS = [
    `https://prod-public-api.livescore.com/v1/api/app/match/soccer/${MATCH_ID}/h2h`,
    `https://prod-public-api.livescore.com/v1/api/app/match/soccer/${MATCH_ID}/details`,
    `https://prod-public-api.livescore.com/v1/api/app/stage/soccer/21997/standing?locale=en`, // Standings often have form
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
                fs.writeFileSync(`dump_final_${url.split('/').pop()}.json`, JSON.stringify(data, null, 2));
            }
        } catch (e) {
            console.log("Failed:", e.message);
        }
    }
};

testScrape();
