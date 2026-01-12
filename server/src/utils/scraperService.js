import puppeteer from 'puppeteer';

/**
 * Scrapes FBref.com for Team Form via Team Pages.
 */
export const getFormFromScraper = async (homeName, awayName, dateStr) => {
    let browser = null;
    try {
        console.log(`🕷️ Scraper (FBref): Fetching Form for "${homeName}" vs "${awayName}" (Date: ${dateStr || 'Default'})`);

        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36');

        // 1. Go to Daily Matches List on FBref
        // If dateStr is provided (YYYY-MM-DD), use it. Else default.
        const listUrl = dateStr ? `https://fbref.com/en/matches/${dateStr}` : "https://fbref.com/en/matches/";
        await page.goto(listUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // 2. Find Team Links
        const teamLinks = await page.evaluate((h, a) => {
            const clean = (n) => n.toLowerCase().replace(/ fc| cf| real| football club| utd| united/g, '').trim();
            const hClean = clean(h);
            const aClean = clean(a);

            const rows = Array.from(document.querySelectorAll('table.stats_table tbody tr'));

            for (const r of rows) {
                const homeNode = r.querySelector('td[data-stat="home_team"] a');
                const awayNode = r.querySelector('td[data-stat="away_team"] a');

                if (homeNode && awayNode) {
                    const hText = homeNode.innerText.toLowerCase();
                    const aText = awayNode.innerText.toLowerCase();

                    if (hText.includes(hClean) && aText.includes(aClean)) {
                        return { home: homeNode.href, away: awayNode.href };
                    }
                }
            }
            return null;
        }, homeName, awayName);

        if (!teamLinks) {
            console.log(`   -> ⚠️ Scraper: Match not found in today's list.`);
            return { homeForm: "N/A", awayForm: "N/A" };
        }

        console.log(`   -> Found Team Links:`);
        console.log(`      Home: ${teamLinks.home}`);
        console.log(`      Away: ${teamLinks.away}`);

        // 3. Extract Form from Team Pages
        const getTeamForm = async (url) => {
            try {
                const teamPage = await browser.newPage();
                await teamPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36');
                await teamPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

                // Extract last 5 results from "Match Log" or similar
                const form = await teamPage.evaluate(() => {
                    // Try to find the "Scores & Fixtures" table or "Match Log"
                    // Usually there is a table id like "matchlogs_for" or "matchlogs_all"

                    // Strategy: Look for the big table of matches and take the LAST 5 rows that have a result.
                    // Filter for rows that are NOT the current future match.

                    // General Table Selector for match logs
                    const rows = Array.from(document.querySelectorAll('table tbody tr')).reverse();

                    const results = [];
                    for (const r of rows) {
                        if (results.length >= 5) break;

                        // Check for Result column (W/D/L)
                        const resultCell = r.querySelector('td[data-stat="result"]');
                        if (resultCell && resultCell.innerText.trim()) {
                            results.push(resultCell.innerText.trim());
                        }
                    }

                    return results.reverse().join(''); // e.g. "WWLDW"
                });

                await teamPage.close();
                return form || "N/A";
            } catch (e) {
                console.error(`      -> Error extracting form from ${url}:`, e.message);
                return "Error";
            }
        };

        const [homeForm, awayForm] = await Promise.all([
            getTeamForm(teamLinks.home),
            getTeamForm(teamLinks.away)
        ]);

        console.log(`   -> ✅ Form Extracted: Home="${homeForm}", Away="${awayForm}"`);
        return { homeForm, awayForm };

    } catch (e) {
        console.error("   -> ❌ Scraper Error:", e.message);
        return { homeForm: "N/A", awayForm: "N/A" };
    } finally {
        if (browser) await browser.close();
    }
};
