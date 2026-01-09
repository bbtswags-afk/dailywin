
import prisma from './server/src/utils/prisma.js';

const email = process.argv[2];

if (!email) {
    console.log("Please provide an email. Usage: node make_admin.js user@example.com");
    process.exit(1);
}

async function main() {
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log(`❌ User ${email} not found! Please sign up first.`);
            return;
        }

        await prisma.user.update({
            where: { email },
            data: { role: 'admin' }
        });

        console.log(`✅ Success! ${email} is now an ADMIN.`);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
