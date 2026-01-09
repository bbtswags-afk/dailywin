
// import fetch from 'node-fetch'; // Using native fetch in Node 18+

const LOGIN_URL = 'http://localhost:5000/api/auth/login';
const email = 'admin@dailywin.space';
const password = 'Tunde-5445775445';

async function testLogin() {
    console.log(`🚀 Testing API Login: ${LOGIN_URL}`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);

    try {
        const response = await fetch(LOGIN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const status = response.status;
        const data = await response.json();

        console.log(`\n📡 Status: ${status}`);
        console.log(`📦 Response:`, JSON.stringify(data, null, 2));

        if (status === 200) {
            console.log("✅ API Login SUCCESS!");
        } else {
            console.log("❌ API Login FAILED.");
        }

    } catch (error) {
        console.error("❌ Network Error:", error.message);
    }
}

testLogin();
