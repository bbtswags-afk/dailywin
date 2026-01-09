import puppeteer from 'puppeteer';

const run = async () => {
    console.log("Launching Browser...");
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        console.log("Navigating to Flashscore...");
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36');

        // Go to live scores
        await page.goto('https://www.flashscore.mobi/football/', { waitUntil: 'networkidle2', timeout: 30000 });

        console.log("Page Loaded. extracting...");

        // Selector for mobi might be different. 
        // Trying to get match rows
        const matches = await page.evaluate(() => {
            const results = [];
            document.querySelectorAll('.match-row').forEach(row => {
                const home = row.querySelector('.home-team')?.innerText;
                const away = row.querySelector('.away-team')?.innerText;
                const score = row.querySelector('.score')?.innerText;
                if (home && away) {
                    results.push({ home, away, score });
                }
            });
            return results;
        });

        console.log("Matches Found:", matches);
    } catch (e) {
        console.error("Puppeteer Error:", e);
    } finally {
        await browser.close();
    }
};

run();
