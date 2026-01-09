
const LOGIN_URL = 'http://localhost:5000/api/auth/login';
const USERS_URL = 'http://localhost:5000/api/admin/users';

const adminEmail = 'admin@dailywin.space';
const adminPassword = 'Tunde-5445775445';

async function listUsers() {
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
    console.log("📋 Fetching User List...");

    const listRes = await fetch(USERS_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const users = await listRes.json();
    console.log(`🔢 Total Users Returned: ${users.length}`);

    users.forEach(u => {
        if (u.email.includes('jandaispace') || u.email.includes('premium')) {
            console.log(`   - ${u.email} | Plan: '${u.plan}' | Status: ${u.subscriptionStatus}`);
        }
    });
}

listUsers();
