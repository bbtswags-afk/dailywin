
import prisma from '../utils/prisma.js';
import { generateDailyPredictions } from '../utils/aiEngine.js';

// Get Dashboard Stats (Optional but useful)
export const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await prisma.user.count();
        const premiumUsers = await prisma.user.count({ where: { plan: 'premium' } });
        const recentUsers = await prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, email: true, plan: true, createdAt: true }
        });

        res.json({ totalUsers, premiumUsers, recentUsers });
    } catch (error) {
        res.status(500).json({ message: "Error fetching stats" });
    }
};

// Manually Upgrade User
export const manualUpgrade = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Set 30 days expiry
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 30);

        const updatedUser = await prisma.user.update({
            where: { email },
            data: {
                plan: 'premium',
                subscriptionStatus: 'active',
                subscriptionStart: startDate,
                subscriptionEnd: endDate
            }
        });

        res.json({ message: `Success! ${user.email} is now Premium.`, user: updatedUser });

    } catch (error) {
        console.error("Upgrade Error:", error);
        res.status(500).json({ message: "Failed to upgrade user" });
    }
};
// Get All Premium Users
export const getPremiumUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: { plan: 'premium' },
            select: {
                id: true,
                email: true,
                plan: true,
                subscriptionStart: true,
                subscriptionEnd: true,
                subscriptionStatus: true
            },
            orderBy: { subscriptionEnd: 'desc' }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
};

// Downgrade User (Revoke Premium)
export const downgradeUser = async (req, res) => {
    try {
        const { email } = req.body;
        await prisma.user.update({
            where: { email },
            data: {
                plan: 'free',
                subscriptionStatus: 'cancelled',
                subscriptionEnd: null
            }
        });
        res.json({ message: `Downgraded ${email} to free` });
    } catch (error) {
        res.status(500).json({ message: "Error downgrading user" });
    }
};

// Delete User
export const deleteUser = async (req, res) => {
    try {
        const { email } = req.body;
        await prisma.user.delete({
            where: { email }
        });
        res.json({ message: `Deleted user ${email}` });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user" });
    }
};

// Force Trigger Generator
export const triggerGeneration = async (req, res) => {
    try {
        console.log("⚡ Admin triggered manual generation...");
        // Run in background so we don't block response
        generateDailyPredictions().then(preds => {
            console.log(`✅ Manual generation complete. ${preds.length} games.`);
        }).catch(err => {
            console.error("❌ Manual generation failed:", err);
        });

        res.json({ message: "Generation started! Check back in 2-3 minutes." });
    } catch (error) {
        res.status(500).json({ message: "Failed to trigger generation" });
    }
};
