
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Testing DB Connection...");
    try {
        const count = await prisma.user.count();
        console.log(`✅ Connection Successful! User count: ${count}`);

        const user = await prisma.user.findFirst();
        console.log("Sample User:", user);
    } catch (e) {
        console.error("❌ DB Connection Failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
