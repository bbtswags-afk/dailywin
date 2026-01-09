
const LOGIN_URL = 'http://localhost:5000/api/auth/login';
const PREDICTIONS_URL = 'http://localhost:5000/api/predictions';
const email = 'jandaispace@gmail.com';
const password = 'password123'; // I need to know the user's password to login as them. 
// Or I can use a known user I create.

// Problem: I don't know jandaispace's password. 
// Plan B: Create a temporary premium user with known password to test.

const tempEmail = 'premium_test_' + Date.now() + '@test.com';
const tempPass = 'password123';

async function testPremiumAccess() {
    console.log("🚀 Testing Premium Access Logic...");

    // 1. Register User
    console.log("1️⃣ Registering new user...");
    const regRes = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: tempEmail, password: tempPass, name: 'Tester' })
    });
    const regData = await regRes.json();
    console.log(`   User ID: ${regData.id}`);

    // 2. Admin Upgrade (Need Admin Token first)
    console.log("2️⃣ Logging in as Admin...");
    let loginRes = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@dailywin.space', password: 'Tunde-5445775445' })
    });
    const adminData = await loginRes.json();
    const adminToken = adminData.token;

    console.log("3️⃣ Upgrading user via Admin API...");
    const upgRes = await fetch('http://localhost:5000/api/admin/upgrade', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ email: tempEmail })
    });
    console.log("   Upgrade Status:", await upgRes.text());

    // 3. Login as User to get THEIR token
    console.log("4️⃣ Logging in as User to get Token...");
    loginRes = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: tempEmail, password: tempPass })
    });
    const userData = await loginRes.json();
    const userToken = userData.token;
    console.log(`   User Plan in Login Response: ${userData.plan}`);
    // This comes from the LOGIN endpoint generating a NEW token.

    // 4. Fetch Predictions
    console.log("5️⃣ Fetching Predictions as User...");
    const predRes = await fetch(PREDICTIONS_URL, {
        headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const predictions = await predRes.json();

    // Check if locked
    const lockedCount = predictions.filter(p => p.isLocked).length;
    console.log(`   Total Predictions: ${predictions.length}`);
    console.log(`   Locked Predictions: ${lockedCount}`);

    if (lockedCount === 0 && predictions.length > 0) {
        console.log("✅ SUCCESS: All content unlocked!");
    } else {
        console.log("❌ FAILURE: Content is still locked.");
    }
}

testPremiumAccess();
