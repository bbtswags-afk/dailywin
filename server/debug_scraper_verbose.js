
import { getFormFromScraper } from './src/utils/scraperService.js';

// Hardcode a known game from today (from recent output: RB Leipzig vs Freiburg)
const H = "RB Leipzig";
const A = "Freiburg";
const D = "2026-01-14";

async function debug() {
    console.log(`DEBUG: Scraping ${H} vs ${A} on ${D}`);
    const res = await getFormFromScraper(H, A, D);
    console.log("RESULT:", res);
}

debug();
