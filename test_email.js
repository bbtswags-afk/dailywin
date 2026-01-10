import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

// Override with hardcoded values to trace the issue if .env is wrong
const SMTP_CONFIG = {
    host: process.env.SMTP_HOST || 'smtp.resend.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: (process.env.SMTP_PORT || '465') === '465',
    auth: {
        user: process.env.SMTP_USER || 'resend',
        pass: process.env.SMTP_PASS // Must be the 're_...' key
    }
};

console.log("🛠️ Testing Email Configuration:");
console.log(`- Host: ${SMTP_CONFIG.host}`);
console.log(`- Port: ${SMTP_CONFIG.port}`);
console.log(`- User: ${SMTP_CONFIG.auth.user}`);
console.log(`- Pass: ${SMTP_CONFIG.auth.pass ? (SMTP_CONFIG.auth.pass.substring(0, 5) + '...') : 'MISSING'}`);
console.log(`- From: ${process.env.EMAIL_USER}`);

const transporter = nodemailer.createTransport(SMTP_CONFIG);

const sendTest = async () => {
    try {
        console.log("\n📧 Sending Test Email...");
        const result = await transporter.sendMail({
            from: `"Test Script" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'Resend Configuration Test 🚀',
            text: 'If you are reading this, your Resend API Key and Domain Verification are working perfectly!'
        });
        console.log("✅ Email Sent Successfully!");
        console.log("Message ID:", result.messageId);
    } catch (error) {
        console.error("\n❌ Email Failed:");
        console.error(error.message);

        if (error.response) {
            console.error("\nServer Response:", error.response);
        }
    }
};

sendTest();
