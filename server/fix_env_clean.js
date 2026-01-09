import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');

const content = `DATABASE_URL="postgresql://neondb_owner:npg_2ysw5YEolbcP@ep-steep-hill-ah1d28dl-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
API_FOOTBALL_KEY="73fa7b81181efafeb63e211253c6452d,39527cb5529d564d2bf7ebd5f325d043"
GEMINI_API_KEY="AIzaSyBp5v5w1b-CEUD_qEX0D7WxWj2XP1K5BQ0"
OVERRIDE_DATE="2025-01-04"
JWT_SECRET="production_secret_key_dailywin_ai_2024"
CLIENT_URL="http://localhost:5173"
`;

try {
    fs.writeFileSync(envPath, content.trim());
    console.log("✅ FIXED .env CONTENT (Clean Write).");
} catch (e) {
    console.error(e);
}
