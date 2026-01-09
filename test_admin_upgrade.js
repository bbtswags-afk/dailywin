
// import fetch from 'node-fetch'; // Native Node 18+

const UPGRADE_URL = 'http://localhost:5000/api/admin/upgrade';
const adminEmail = 'admin@dailywin.space';
// Assuming we have a valid token... wait, admin routes are protected.
// I need to login first to get a token.

const LOGIN_URL = 'http://localhost:5000/api/auth/login';
const adminPassword = 'Tunde-5445775445';
const targetUser = 'jandaispace@gmail.com';

async function testUpgrade() {
    console.log("🚀 Starting Admin Upgrade Test...");

    // 1. Login
    console.log("🔑 Logging in as Admin...");
    const loginRes = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword })
    });

    if (!loginRes.ok) {
        console.log("❌ Login Failed:", await loginRes.text());
        return;
    }

    const { token } = await loginRes.json();
    console.log("✅ Logged in. Token received.");

    // 2. Upgrade
    console.log(`⬆️ Upgrading user: ${targetUser}`);
    const upgradeRes = await fetch(UPGRADE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: targetUser })
    });

    const status = upgradeRes.status;
    const data = await upgradeRes.json();

    console.log(`📡 Status: ${status}`);
    console.log(`📦 Response:`, JSON.stringify(data, null, 2));

    if (status === 200) {
        console.log("✅ Upgrade SUCCESS!");
    } else {
        console.log("❌ Upgrade FAILED.");
    }

    // 3. Get User List
    console.log("📋 Fetching Admin User List...");
    const listRes = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const users = await listRes.json();
    console.log(`   Total Premium Users: ${users.length}`);
    const found = users.find(u => u.email === targetUser);
    if (found) {
        console.log("✅ API confirms user is in the list:", found);
    } else {
        console.log("❌ User NOT found in list. Possible filtering issue.");
    }
}

testUpgrade();
