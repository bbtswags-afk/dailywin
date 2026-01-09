import { getDailyFixtures, getHeadToHead, getLeagueStandings } from './src/utils/footballApi.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const run = async () => {
    console.log("🕵️ TESTING DEEP DATA (API-Football)...");

    // 1. Get a Game
    const fixtures = await getDailyFixtures(); // Uses OVERRIDE_DATE from .env
    if (!fixtures.response || fixtures.response.length === 0) {
        console.log("No games found for date.");
        return;
    }

    const game = fixtures.response[0];
    console.log(`\n⚽ Match: ${game.teams.home.name} vs ${game.teams.away.name}`);
    console.log(`🏆 League: ${game.league.name}`);

    // 2. Head to Head
    console.log("\n⚔️ Checking H2H...");
    const h2h = await getHeadToHead(game.teams.home.id, game.teams.away.id);
    if (h2h.response) {
        console.log(`   Found ${h2h.response.length} previous meetings.`);
        h2h.response.slice(0, 2).forEach(m => console.log(`   - ${m.teams.home.name} ${m.goals.home}-${m.goals.away} ${m.teams.away.name}`));
    } else {
        console.log("   No H2H data.");
    }

    // 3. Form (Standings)
    console.log("\n📈 Checking Form...");
    const standings = await getLeagueStandings(game.league.id, game.league.season);
    if (standings.response && standings.response[0] && standings.response[0].league.standings) {
        const table = standings.response[0].league.standings[0];
        const homeEntry = table.find(t => t.team.id === game.teams.home.id);
        if (homeEntry) console.log(`   🏠 Home Form: ${homeEntry.form} (Rank ${homeEntry.rank})`);
        else console.log("   🏠 Home Form: Not found in table.");
    } else {
        console.log("   No Standings data.");
    }

    console.log("\n✅ CONCLUSION: If you see data above, the API is working perfectly for Analysis.");
};

run();
