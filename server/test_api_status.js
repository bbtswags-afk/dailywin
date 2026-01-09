import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    const API_KEY = process.env.API_FOOTBALL_KEY;
    const API_HOST = 'api-football-v1.p.rapidapi.com';
    const headers = {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST
    };

    try {
        console.log("Checking API Status (RapidAPI endpoint)...");
        const response = await fetch(`https://${API_HOST}/v3/status`, { headers });
        const data = await response.json();
        console.log("Status Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Status Check Error:", e);
    }
};

run();
