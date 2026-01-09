import fs from 'fs';
import path from 'path';

const content = `DATABASE_URL=postgresql://neondb_owner:npg_2ysw5YEolbcP@ep-steep-hill-ah1d28dl-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=production_secret_key_dailywin_ai_2024
GEMINI_API_KEY=AIzaSyBp5v5w1b-CEUD_qEX0D7WxWj2XP1K5BQ0
API_FOOTBALL_KEY=3763192628162b5713faeb53a6bab9db
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=re_aZqui3np_PFNmgWWzn3aZz1ik3ysWtsXF
EMAIL_USER=admin@dailywin.space
FRONTEND_URL=http://localhost:5173`;

fs.writeFileSync(path.join(process.cwd(), 'server', '.env'), content);
console.log(".env file created successfully in server/ directory.");
