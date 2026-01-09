import { getLiveScores } from './src/utils/footballApi.js';

const run = async () => {
    console.log("Testing Backend getLiveScores with Rotation...");
    const data = await getLiveScores();
    console.log("Result Count:", data.response ? data.response.length : "Error");
    if (data.response && data.response.length > 0) {
        console.log("First Game:", data.response[0].league.name, data.response[0].teams.home.name);
    } else {
        console.log("Raw Response:", JSON.stringify(data).substring(0, 200));
    }
};
run();
