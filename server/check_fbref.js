
import fetch from 'node-fetch';

const url = "https://fbref.com/en/matches/2025-01-14";

async function check() {
    console.log("Fetching:", url);
    const res = await fetch(url);
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Title Extract:", text.match(/<title>(.*?)<\/title>/)?.[1]);

    if (text.includes("RB Leipzig") || text.includes("Leipzig")) {
        console.log("✅ Found Leipzig in text");
    } else {
        console.log("❌ Leipzig NOT found in text");
    }
}

check();
