
import { getPredictions } from './src/controllers/predictionController.js';

// MOCKING DEPENDENCIES
// We need to mock generateDailyPredictions, but it imports Prisma.
// Instead of complex mocking, we will just use the real checking logic but mock the REQUEST.

console.log("🚀 Testing Access Control Logic...");

const mockRes = () => {
    return {
        json: (data) => {
            console.log("   -> Response Length:", data.length);
            // Check first item
            console.log("   -> Game #1:", data[0].prediction === 'LOCKED 🔒' ? 'LOCKED' : 'VISIBLE', "| Analysis:", data[0].analysis.includes('Locked') ? 'LOCKED' : 'VISIBLE');
            // Check second item
            if (data.length > 1) {
                console.log("   -> Game #2:", data[1].prediction === 'LOCKED 🔒' ? 'LOCKED' : 'VISIBLE', "| Analysis:", data[1].analysis.includes('Locked') ? 'LOCKED' : 'VISIBLE');
            }
        },
        status: (code) => {
            console.log("   -> Status:", code);
            return { json: (d) => console.log("   -> Error:", d) };
        }
    };
};

async function runTests() {
    // 1. GUEST TEST
    console.log("\n🧪 TEST 1: GUEST (No User)");
    const reqGuest = { user: null, query: {} };
    await getPredictions(reqGuest, mockRes());

    // 2. FREE USER TEST
    console.log("\n🧪 TEST 2: FREE USER");
    const reqFree = {
        user: { email: 'free@user.com', plan: 'free', subscriptionStatus: 'cancelled' },
        query: {}
    };
    await getPredictions(reqFree, mockRes());

    // 3. PREMIUM USER TEST
    console.log("\n🧪 TEST 3: PREMIUM USER");
    const reqPremium = {
        user: {
            email: 'vip@user.com',
            plan: 'premium',
            subscriptionStatus: 'active',
            subscriptionEnd: new Date('2026-12-31')
        },
        query: {}
    };
    await getPredictions(reqPremium, mockRes());
}

// We need to bypass the real generateDailyPredictions executing DB calls if we aren't connected?
// No, the user has local DB. It should work.

runTests();
