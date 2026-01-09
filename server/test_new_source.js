
import fs from 'fs';

const URL = "https://watchlivesports.click/soccerstats/";

const testSource = async () => {
    try {
        console.log(`Fetching: ${URL}`);
        const res = await fetch(URL, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });

        console.log("Status:", res.status);
        const text = await res.text();
        console.log("Length:", text.length);

        // Save dump
        fs.writeFileSync('new_source_dump.html', text);
        console.log("Saved to new_source_dump.html");

        // Quick Keyword Check
        if (text.includes('Head to Head')) console.log("Found 'Head to Head'");
        if (text.includes('Last 5')) console.log("Found 'Last 5'");
        if (text.includes('Arsenal')) console.log("Found Team Name (Arsenal)");

    } catch (e) {
        console.error(e);
    }
}

testSource();
