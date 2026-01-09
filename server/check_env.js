import dotenv from 'dotenv';
dotenv.config();

console.log("Checking Email Config...");
console.log("SMTP_HOST:", process.env.SMTP_HOST || "Using Default");
console.log("SMTP_USER Present:", !!(process.env.SMTP_USER || process.env.EMAIL_USER));
console.log("SMTP_PASS Present:", !!(process.env.SMTP_PASS || process.env.EMAIL_PASS));
