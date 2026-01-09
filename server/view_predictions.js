
import prisma from './src/utils/prisma.js';

import fs from 'fs';

const view = async () => {
    const preds = await prisma.prediction.findMany({
        orderBy: { date: 'desc' },
        take: 5
    });

    let output = "--- LATEST PREDICTIONS ---\n";
    preds.forEach(p => {
        output += `\nMatch: ${p.homeTeam} vs ${p.awayTeam}\n`;
        output += `Prediction: ${p.prediction}\n`;
        output += `Analysis: ${p.analysis}\n`;
        output += `Reasoning: ${p.reasoning}\n`;
        output += `--------------------------\n`;
    });
    fs.writeFileSync('view_output.txt', output);
    console.log("Saved to view_output.txt");
};

view();
