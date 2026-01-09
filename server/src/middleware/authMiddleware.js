import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';

export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: {
                    id: true,
                    email: true,
                    plan: true,
                    role: true, // Needed for admin check
                    usageCount: true,
                    lastUsageDate: true,
                    subscriptionEnd: true
                },
            });

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Check for Subscription Expiry
            if (req.user.plan === 'premium' && req.user.subscriptionEnd) {
                if (new Date() > new Date(req.user.subscriptionEnd)) {
                    console.log(`📉 Subscription expired for ${req.user.email}. Downgrading...`);

                    req.user = await prisma.user.update({
                        where: { id: req.user.id },
                        data: {
                            plan: 'free',
                            subscriptionStatus: 'expired'
                        },
                        select: {
                            id: true,
                            email: true,
                            plan: true,
                            role: true,
                            usageCount: true,
                            lastUsageDate: true
                        }
                    });
                }
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

// Optional auth for public routes that might change based on user
export const optionalProtect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: {
                    id: true,
                    email: true,
                    plan: true,
                    usageCount: true,
                    lastUsageDate: true,
                    subscriptionStatus: true,
                    subscriptionEnd: true
                },
            });
        } catch (error) {
            console.warn("Optional auth failed", error);
        }
    }
    next();
};
