import cheerio from 'cheerio';

const run = async () => {
    try {
        console.log("Fetching https://www.flashscore.mobi/ ...");
        const res = await fetch('https://www.flashscore.mobi/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        console.log("Status:", res.status);
        const html = await res.text();
        console.log("Length:", html.length);

        if (html.includes("score")) {
            console.log("Found 'score' in HTML. Parsing...");
            // Simple regex or cheerio check
            const $ = cheerio.load(html);
            console.log("Title:", $('title').text());
            // Log some content
            console.log("Sample:", $('body').text().substring(0, 200));
        } else {
            console.log("Likely blocked/JS challenge.");
        }

    } catch (e) {
        console.error(e);
    }
};

run();
