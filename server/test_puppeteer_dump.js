import puppeteer from 'puppeteer';
import fs from 'fs';

const run = async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36');

        console.log("Navigating to Flashscore.mobi...");
        await page.goto('https://www.flashscore.mobi/football/', { waitUntil: 'networkidle2' });

        // Dump HTML
        const html = await page.content();
        fs.writeFileSync('debug_scrape.html', html);
        console.log("Dumped HTML to debug_scrape.html");

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
};

run();
