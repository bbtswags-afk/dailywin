
import prisma from './src/utils/prisma.js';

const email = 'jandaispace@gmail.com';

async function checkUser() {
    console.log(`🔍 Checking for user: ${email}`);
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
        console.log(`✅ User FOUND. Plan: '${user.plan}'`);
        console.log(`   Subscription End: ${user.subscriptionEnd}`);
    } else {
        console.log("❌ User NOT FOUND.");
    }
    await prisma.$disconnect();
}

checkUser();
