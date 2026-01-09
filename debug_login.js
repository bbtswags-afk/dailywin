
import prisma from './server/src/utils/prisma.js';
import bcrypt from 'bcryptjs';

const email = 'admin@dailywin.space';
// The password we expect
const password = 'Tunde-5445775445';

async function main() {
    console.log(`🔍 Debugging Login for: ${email}`);

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            console.log("❌ User NOT FOUND in database.");
            return;
        }

        console.log(`✅ User Found! ID: ${user.id}, Role: ${user.role}`);

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            console.log("✅ Password MATCHES! Login should work.");
        } else {
            console.log("❌ Password DOES NOT MATCH.");
            console.log("   Stored Hash:", user.password);

            // Attempt to reset it right now to be sure
            const salt = await bcrypt.genSalt(10);
            const newHash = await bcrypt.hash(password, salt);

            await prisma.user.update({
                where: { email },
                data: { password: newHash }
            });
            console.log("✅ Password has been RESET to: " + password);
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
