
import prisma from './src/utils/prisma.js';

async function check() {
    console.log("Checking DB...");
    const latest = await prisma.prediction.findFirst({
        orderBy: { createdAt: 'desc' }
    });

    if (!latest) {
        console.log("No predictions found.");
    } else {
        console.log("Latest Prediction:", latest.homeTeam, "vs", latest.awayTeam);
        console.log("Form Data:", latest.homeForm, "|", latest.awayForm);
    }
}

check();
