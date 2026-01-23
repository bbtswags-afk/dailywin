
import fetch from 'node-fetch';

const probe = async () => {
    const mkUrl = (params) => `https://www.thesportsdb.com/api/v1/json/3/eventslast.php?id=133738${params}`;

    const tryParams = async (name, p) => {
        const res = await fetch(mkUrl(p));
        const data = await res.json();
        const count = data.results ? data.results.length : 0;
        console.log(`Probe [${name}]: Found ${count} events.`);
        if (count > 0) {
            console.log(`   - First: ${data.results[0].strEvent} (${data.results[0].strLeague})`);
        }
    };

    await tryParams("Standard", "");
    // await tryParams("Season 25-26", "&s=2025-2026");
    // await tryParams("Season 2026", "&s=2026");
    // await tryParams("No League?", "&l=0");
};

probe();
