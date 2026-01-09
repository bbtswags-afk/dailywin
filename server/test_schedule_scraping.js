// Native fetch used
import fs from 'fs';
import { getTrueDate } from './src/utils/timeService.js';

const getScrapedDailyFixtures = async () => {
    try {
        const dateObj = await getTrueDate();
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const dateParam = `${yyyy}${mm}${dd}`;

        console.log(`Fetching Schedule from: https://prod-public-api.livescore.com/v1/api/app/date/soccer/${dateParam}/0?locale=en&MD=1`);

        const res = await fetch(`https://prod-public-api.livescore.com/v1/api/app/date/soccer/${dateParam}/0?locale=en&MD=1`);
        if (res.ok) {
            const data = await res.json();
            console.log("Stages Found:", data.Stages?.length);

            // Check top leagues
            const epl = data.Stages?.find(s => s.Snm === "Premier League" && s.Cnm === "England");
            if (epl) {
                console.log("Found Premier League!");
                const output = epl.Events.map(e => `[${e.Eid}] ${e.T1[0].Nm} vs ${e.T2[0].Nm}`).join('\n');
                console.log(output);
                fs.writeFileSync('schedule_output.txt', output);
            } else {
                console.log("Premier League not found in schedule.");
            }
        } else {
            console.log("Failed:", res.status);
        }

    } catch (e) {
        console.error(e);
    }
};

getScrapedDailyFixtures();
