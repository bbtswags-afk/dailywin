
import prisma from './src/utils/prisma.js';
import bcrypt from 'bcryptjs';

const email = 'admin@dailywin.space';
const password = 'Tunde-5445775445';
const name = 'DailyWin Admin';

async function main() {
    console.log(`Creating Admin User: ${email}...`);

    try {
        // 1. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Upsert the user (Create if new, Update if exists)
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'admin',
                plan: 'premium'
            },
            create: {
                email,
                name,
                password: hashedPassword,
                role: 'admin',
                plan: 'premium'
            }
        });

        console.log(`✅ Success! Admin Account Created/Updated.`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`\nYou can now log in at /login`);

    } catch (e) {
        console.error("❌ Error creating admin:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
