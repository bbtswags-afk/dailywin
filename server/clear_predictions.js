
import prisma from './src/utils/prisma.js';

async function clearAll() {
    console.log("🧹 Clearing ALL predictions to force Logo Refresh...");
    const deleted = await prisma.prediction.deleteMany({});
    console.log(`✅ Deleted ${deleted.count} predictions.`);
    await prisma.$disconnect();
}

clearAll();
