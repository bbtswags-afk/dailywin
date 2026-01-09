import dotenv from 'dotenv';
dotenv.config();

console.log("Checking API Key Config...");
const key = process.env.API_FOOTBALL_KEY;
if (!key) {
    console.error("❌ API_FOOTBALL_KEY is undefined/empty in process.env");
} else {
    console.log("✅ API_FOOTBALL_KEY is present.");
    console.log("Length:", key.length);
    console.log("Starts with:", key.substring(0, 4) + "...");
}
