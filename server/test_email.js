import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
// Load from the same directory
dotenv.config();

console.log("🛠️ Testing Email Configuration (Local Script)...");

const SMTP_CONFIG = {
    host: process.env.SMTP_HOST || 'smtp.resend.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: (process.env.SMTP_PORT || '465') === '465',
    auth: {
        user: process.env.SMTP_USER || 'resend',
        pass: process.env.SMTP_PASS
    }
};

console.log(`- Host: ${SMTP_CONFIG.host}`);
console.log(`- Connection User: ${SMTP_CONFIG.auth.user}`);
console.log(`- Key Length: ${SMTP_CONFIG.auth.pass ? SMTP_CONFIG.auth.pass.length : 0} chars`);
console.log(`- Sender: ${process.env.EMAIL_USER}`);

const transporter = nodemailer.createTransport(SMTP_CONFIG);

const sendTest = async () => {
    try {
        console.log("\n📧 Sending Test Email...");
        const result = await transporter.sendMail({
            from: `"Dailywin Debug" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'Dailywin Resend Test 🚀',
            text: 'This is a test email to verify your Resend configuration is working correctly.'
        });
        console.log("✅ Email Sent Successfully!");
        console.log("Message ID:", result.messageId);
        console.log("👉 CHECK YOUR SPAM FOLDER NOW!");
    } catch (error) {
        console.error("\n❌ Email Failed:");
        console.error("Error Message:", error.message);
        console.error("Error Code:", error.code);
        if (error.response) {
            console.error("Server Response:", error.response);
        }
    }
};

sendTest();
