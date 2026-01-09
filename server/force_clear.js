
import prisma from "./src/utils/prisma.js";

async function clear() {
    console.log("Force Clearing Today's Predictions...");
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);

    const deleted = await prisma.prediction.deleteMany({
        where: {
            date: { gte: start, lte: end }
        }
    });
    console.log(`Deleted ${deleted.count} predictions.`);
}
clear();
