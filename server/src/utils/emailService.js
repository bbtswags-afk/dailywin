import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: (process.env.SMTP_PORT || '587') === '465', // true for 465, false for 587
    auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
    },
});

export const sendWelcomeEmail = async (email) => {
    console.log(`📧 Attempting to send Welcome Email to: ${email}`);
    // Debug: Check if creds exist (don't log values)
    if (!process.env.SMTP_USER && !process.env.EMAIL_USER) console.error("❌ MISSING EMAIL USER ENV VARS");
    if (!process.env.SMTP_PASS && !process.env.EMAIL_PASS) console.error("❌ MISSING EMAIL PASS ENV VARS");

    try {
        await transporter.sendMail({
            from: `"Dailywin AI" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to Dailywin AI! ⚽',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h1 style="color: #10b981;">Welcome to the Winning Team!</h1>
                    <p>Thanks for joining Dailywin AI. We're excited to help you make smarter predictions.</p>
                    <p>Check out our dashboard to see today's top AI picks!</p>
                    <br/>
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
                </div>
            `
        });
        console.log(`Welcome email sent to ${email}`);
    } catch (error) {
        console.error("❌ Email Sending Failed:", error.message);
        // We don't throw here to avoid breaking the Signup flow if email fails
    }
};

export const sendPasswordResetEmail = async (email, token) => {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${baseUrl}/reset-password/${token}`;

    try {
        await transporter.sendMail({
            from: `"Dailywin AI" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Reset Password Request',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>Password Reset Request</h2>
                    <p>You requested a password reset. Click the link below to set a new password:</p>
                    <a href="${resetUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0;">Reset Password</a>
                    <p>This link expires in 1 hour.</p>
                    <p style="font-size: 12px; color: #666;">If you didn't ask for this, please ignore this email.</p>
                </div>
            `
        });
        console.log(`Reset email sent to ${email}`);
    } catch (error) {
        console.error("Email Error:", error);
    }
};
