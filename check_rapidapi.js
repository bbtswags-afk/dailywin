import 'dotenv/config'; // Load .env file
import fetch from 'node-fetch';

const RAPID_API_KEY = process.env.RAPID_API_KEY;
const HOST = "api-football-v1.p.rapidapi.com";

console.log("🔑 Testing RapidAPI Key:", RAPID_API_KEY ? "Loaded" : "Missing");

const checkConnection = async () => {
    try {
        // Search for Real Madrid
        console.log("1️⃣ Searching for 'Real Madrid'...");
        const url = `https://${HOST}/v3/teams?name=Real Madrid`;

        const res = await fetch(url, {
            headers: {
                "x-rapidapi-key": RAPID_API_KEY,
                "x-rapidapi-host": HOST
            }
        });

        const data = await res.json();

        if (data.results > 0) {
            const team = data.response[0].team;
            console.log(`✅ SUCCESS! Found Team: ${team.name} (ID: ${team.id})`);
            console.log(`   Country: ${team.country}`);
            console.log(`   Logo: ${team.logo}`);
            console.log("\n🚀 RapidAPI Connection Verfied. The migration works.");
        } else {
            console.log("❌ Connection worked, but no data found. Check Key Permissions?");
            console.log(JSON.stringify(data, null, 2));
        }

    } catch (e) {
        console.error("❌ Validaton Failed:", e.message);
    }
};

checkConnection();
