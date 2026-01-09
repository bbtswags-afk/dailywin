const run = async () => {
    try {
        console.log("Fetching LiveScore API...");
        // This is a known endpoint for LiveScore.com
        const res = await fetch('https://prod-public-api.livescore.com/v1/api/app/live/soccer/0?locale=en&MD=1', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Origin': 'https://www.livescore.com',
                'Referer': 'https://www.livescore.com/'
            }
        });

        console.log("Status:", res.status);
        if (res.ok) {
            const data = await res.json();
            console.log("Stages Found:", data.Stages?.length);
            if (data.Stages && data.Stages.length > 0) {
                console.log("Sample Match:", data.Stages[0].Events[0].T1[0].Nm, "vs", data.Stages[0].Events[0].T2[0].Nm);
            }
        } else {
            console.log("Blocked:", await res.text());
        }

    } catch (e) {
        console.error(e);
    }
};

run();
