import prisma from './src/utils/prisma.js';
import bcrypt from 'bcryptjs';

const updateAdminPassword = async () => {
    const email = 'admin@dailywin.space';
    const newPassword = 'Onyebuchi';

    console.log(`🔄 Updating password for ${email}...`);

    try {
        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // check if exists
        const user = await prisma.user.findUnique({ where: { email } });

        if (user) {
            await prisma.user.update({
                where: { email },
                data: {
                    password: hashedPassword,
                    role: 'admin' // Ensure role is admin
                }
            });
            console.log("✅ Password updated successfully for admin@dailywin.space");
            console.log("🔑 New Password: Onyebuchi");
        } else {
            console.log("⚠️ User not found. Creating new Admin...");
            await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: 'Admin User',
                    role: 'admin',
                    plan: 'premium'
                }
            });
            console.log("✅ Admin account created with password 'Onyebuchi'");
        }

    } catch (error) {
        console.error("❌ Failed to update password:", error);
    } finally {
        await prisma.$disconnect();
    }
};

updateAdminPassword();
