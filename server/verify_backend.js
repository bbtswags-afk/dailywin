
// import fetch from 'node-fetch'; // Using native fetch
// If node < 18, we need node-fetch. Assuming >=18 as per earlier context.

const BASE_URL = 'http://localhost:5000';

async function verify() {
    console.log("1. Verification Started...");

    // 1. Health Check
    try {
        const res = await fetch(`${BASE_URL}/`);
        const data = await res.json();
        console.log("Health Check:", data.status === 'ok' ? '✅ Passed' : '❌ Failed');
    } catch (e) {
        console.log("Health Check: ❌ Connection Failed", e.message);
        return;
    }

    // 2. Guest Predictions (Should be limited/filtered)
    try {
        const res = await fetch(`${BASE_URL}/api/predictions`);
        const data = await res.json();
        const safeOnly = data.every(p => p.prediction === 'Over 1.5 Goals' || p.type === 'Safe');
        const limited = data.length <= 3;
        console.log("Guest View:", (safeOnly && limited) ? '✅ Passed (Safe/Limited)' : '❌ Failed');
        console.log(`   - Count: ${data.length}, Items: ${data.map(d => d.prediction).join(', ')}`);
    } catch (e) {
        console.log("Guest View: ❌ Failed", e.message);
    }

    // 3. Signup
    let token = '';
    const email = `test${Math.floor(Math.random() * 10000)}@test.com`;
    try {
        const res = await fetch(`${BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: 'password123' })
        });
        const data = await res.json();
        if (res.ok && data.token) {
            token = data.token;
            console.log("Signup: ✅ Passed");
        } else {
            console.log("Signup: ❌ Failed", data);
        }
    } catch (e) {
        console.log("Signup: ❌ Failed", e.message);
    }

    // 4. Free User Predictions (Should see locks)
    if (token) {
        try {
            const res = await fetch(`${BASE_URL}/api/predictions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            const hasLocks = data.some(p => p.isLocked);
            console.log("Auth View (Free):", hasLocks ? '✅ Passed (Contains Locks)' : '⚠️ Warning (No locks found - maybe only safe games today?)');

            if (data.length > 3) {
                console.log("Auth View (Count): ✅ Passed (Full list)");
            }
        } catch (e) {
            console.log("Auth View: ❌ Failed", e.message);
        }
    }
}

verify();
