import { generateDailyPredictions } from './src/utils/aiEngine.js';
import { getScrapedDailyFixtures } from './src/utils/footballApi.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const logFile = path.join(process.cwd(), 'debug_log.txt');
const log = (msg) => {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
};

const runDebug = async () => {
    fs.writeFileSync(logFile, "🚀 STARTING DEBUG RUN\n");

    try {
        log("1. Fetching Fixtures...");
        const data = await getScrapedDailyFixtures();

        if (!data.response) {
            log("❌ API Response has no 'response' key.");
            log(JSON.stringify(data, null, 2));
            return;
        }

        log(`✅ API Returned ${data.response.length} fixtures.`);

        log("2. analyzing League Names from API:");
        const leagues = data.response.map(f => f.league.name);
        leagues.forEach(l => log(`   - ${l}`));

        log("\n3. Running generation Logic (Dry filter check)...");
        // We will manually check the filtering logic here to see what matches
        const STRICT_LEAGUES = [
            'Champions League', 'Premier League', 'LaLiga', 'La Liga', 'Primera Division',
            'Bundesliga', 'Serie A', 'Ligue 1', 'Eredivisie', 'Primeira Liga', 'Liga Portugal',
            'Championship', 'League One', 'Segunda', 'LaLiga 2', 'Hypermotion',
            'Serie B', 'Bundesliga 2', 'Ligue 2', 'World Cup', 'Euro 2024',
            'FA Cup', 'Copa del Rey', 'Coppa Italia', 'DfB Pokal', 'Coupe de France', 'EFL Cup'
        ];

        const strictMatches = data.response.filter(f => {
            const name = f.league.name;
            return STRICT_LEAGUES.some(k => name.includes(k));
        });

        log(`\n✅ Filter would keep ${strictMatches.length} matches.`);
        strictMatches.forEach(f => log(`   KEEP: ${f.teams.home.name} vs ${f.teams.away.name} (${f.league.name})`));

        if (strictMatches.length === 0) {
            log("\n❌ FILTER BLOCKED ALL GAMES. Check 'STRICT_LEAGUES' vs 'Leagues found'.");
        }

        log("\n4. Triggering Full Generation...");
        const results = await generateDailyPredictions();
        log(`\n📊 Final Generator Output: ${results.length} predictions.`);

    } catch (error) {
        log(`❌ Fatal Error: ${error.message}`);
        log(error.stack);
    }
};

runDebug();
