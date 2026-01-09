
import prisma from '../utils/prisma.js';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Plan Configuration
const PLANS = {
    'premium_ngn': { amount: 9000 * 100, currency: 'NGN' }, // 9000 Naira (in kobo)
    'premium_ghs': { amount: 100 * 100, currency: 'GHS' },  // 100 Cedis (in pesewas)
    'premium_uk': { amount: 12 * 100, currency: 'GBP' }     // 12 Pounds (in pence)
};

export const initializePayment = async (req, res) => {
    try {
        const { planType, email } = req.body;
        const user = req.user; // Assuming authMiddleware runs first

        // 1. Validate Plan
        const plan = PLANS[planType];
        if (!plan) return res.status(400).json({ error: "Invalid Plan Type" });

        // 2. Call Paystack Initialize API
        const response = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email || user.email,
                amount: plan.amount,
                currency: plan.currency,
                callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-callback`,
                metadata: {
                    planType,
                    userId: user.id
                }
            })
        });

        const data = await response.json();

        if (!data.status) {
            console.error("Paystack Init Error:", data.message);
            return res.status(400).json({ error: "Payment Initialization Failed", details: data.message });
        }

        // Return the Authorization URL to Frontend
        res.json({ authorization_url: data.data.authorization_url, reference: data.data.reference });

    } catch (error) {
        console.error("Payment Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { reference } = req.body;
        if (!reference) return res.status(400).json({ error: "No reference provided" });

        // 1. Verify with Paystack
        const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
            }
        });

        const data = await response.json();

        if (!data.status || data.data.status !== 'success') {
            return res.status(400).json({ error: "Payment Verification Failed" });
        }

        // 2. Extract Metadata
        const { userId, planType } = data.data.metadata;

        // 3. Calculate Expiry (30 Days)
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 30);

        // 4. Update User in DB
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                plan: planType,
                subscriptionStatus: 'active',
                subscriptionStart: startDate,
                subscriptionEnd: endDate,
                paymentReference: reference
            }
        });

        res.json({ success: true, user: updatedUser });

    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ error: "Verification Server Error" });
    }
};
