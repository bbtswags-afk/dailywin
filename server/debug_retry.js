import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.API_FOOTBALL_KEY ? process.env.API_FOOTBALL_KEY.trim() : '';

const test = async (name, url, headerKey) => {
    console.log(`\n--- Testing ${name} ---`);
    console.log(`URL: ${url}`);
    console.log(`Header: ${headerKey}`);

    const headers = {};
    headers[headerKey] = API_KEY;

    try {
        const response = await fetch(url, { headers });
        const text = await response.text(); // Get text first to avoid JSON parse errors
        console.log(`Status: ${response.status}`);
        try {
            const json = JSON.parse(text);
            console.log("Errors:", JSON.stringify(json.errors || "None"));
            console.log("Results:", json.results);
            if (!json.errors || Object.keys(json.errors).length === 0) console.log("✅ SUCCESS");
        } catch {
            console.log("Body:", text.substring(0, 100));
        }
    } catch (e) {
        console.error("Fetch Failed:", e.message);
    }
};

const run = async () => {
    if (!API_KEY) { console.error("No Key"); return; }

    await test("Direct Mode", "https://v3.football.api-sports.io/status", "x-apisports-key");
    await test("RapidAPI Header on Direct", "https://v3.football.api-sports.io/status", "x-rapidapi-key");
    await test("RapidAPI Host", "https://api-football-v1.p.rapidapi.com/v3/status", "x-rapidapi-key");
};

run();
