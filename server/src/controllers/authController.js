import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../utils/emailService.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

export const registerUser = async (req, res) => {
    const { email, password, name } = req.body;

    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    try {
        const userExists = await prisma.user.findUnique({
            where: { email },
        });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
            },
        });

        if (user) {
            // Send Welcome Email
            console.log("👤 User Created. Sending Welcome Email...");
            try {
                await sendWelcomeEmail(user.email);
                console.log("✅ Welcome Email Sent Successfully.");
            } catch (emailErr) {
                console.error("⚠️ Welcome Email Failed (Non-blocking):", emailErr.message);
            }

            res.status(201).json({
                id: user.id,
                email: user.email,
                name: user.name,
                plan: user.plan,
                token: generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                id: user.id,
                email: user.email,
                name: user.name,
                plan: user.plan,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMe = async (req, res) => {
    if (req.user) {
        res.json({
            id: req.user.id,
            email: req.user.email,
            name: req.user.name,
            plan: req.user.plan,
            usageCount: req.user.usageCount
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

export const updateProfile = async (req, res) => {
    const { name, password, currentPassword } = req.body;
    const userId = req.user.id;

    try {
        const userRecord = await prisma.user.findUnique({ where: { id: userId } });

        const dataToUpdate = {};
        if (name !== undefined) dataToUpdate.name = name;

        if (password) {
            if (password.length < 8) {
                return res.status(400).json({ message: 'New password must be at least 8 characters long' });
            }
            if (!currentPassword) {
                return res.status(400).json({ message: 'Current password is required to set a new password' });
            }

            const isMatch = await bcrypt.compare(currentPassword, userRecord.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Incorrect current password' });
            }

            const salt = await bcrypt.genSalt(10);
            dataToUpdate.password = await bcrypt.hash(password, salt);
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: dataToUpdate,
        });

        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            plan: user.plan,
            token: generateToken(user.id),
        });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
};

export const upgradeUser = async (req, res) => {
    try {
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { plan: 'premium' },
        });

        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            plan: user.plan,
            token: generateToken(user.id),
        });
    } catch (error) {
        console.error("Upgrade Error:", error);
        res.status(500).json({ message: 'Failed to upgrade user' });
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate Token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash it for DB storage (optional security, but usually good)
        // For simplicity here, storing raw or lightly hashed. 
        // Let's store raw for this demo as we aren't doing complex hashing for tokens yet.
        const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 Hour

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: resetToken,
                resetPasswordExpires: resetPasswordExpires
            }
        });

        await sendPasswordResetEmail(user.email, resetToken);

        res.json({ message: 'Email sent' });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null
            }
        });

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};
