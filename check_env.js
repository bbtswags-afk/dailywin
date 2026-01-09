
import dotenv from 'dotenv';
dotenv.config({ path: 'server/.env' });

const url = process.env.DATABASE_URL;
if (!url) {
    console.log("❌ DATABASE_URL is MISSING or EMPTY.");
} else {
    console.log(`✅ DATABASE_URL found: ${url.substring(0, 25)}...`);
    console.log(`   Length: ${url.length}`);
}
