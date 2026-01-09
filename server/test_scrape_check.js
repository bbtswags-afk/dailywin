import https from 'https';

const checkURL = (url) => {
    return new Promise((resolve) => {
        const req = https.get(url, (res) => {
            console.log(`${url} => Status: ${res.statusCode}`);
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                if (data.includes('challenge-platform') || data.includes('Cloudflare')) {
                    console.log(`${url} => Protected by Cloudflare`);
                } else {
                    console.log(`${url} => Seems readable (Length: ${data.length})`);
                }
                resolve();
            });
        });
        req.on('error', (e) => {
            console.log(`${url} => Error: ${e.message}`);
            resolve();
        });
    });
};

const run = async () => {
    console.log("Checking Scrubbability...");
    await checkURL('https://www.flashscore.com/');
    await checkURL('https://api.sofascore.com/api/v1/sport/football/events/live');
};

run();
