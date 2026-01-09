import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    const API_KEY = process.env.API_FOOTBALL_KEY;
    const URL = 'https://v3.football.api-sports.io/status';

    console.log("Testing with Key:", API_KEY ? `${API_KEY.substring(0, 4)}...` : 'UNDEFINED');

    const headers = {
        'x-apisports-key': API_KEY
    };

    console.log("Headers:", JSON.stringify(headers));

    try {
        const response = await fetch(URL, { headers });
        const data = await response.json();
        console.log("Response Status:", response.status);
        console.log("Body:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Fetch Error:", e);
    }
};

run();
