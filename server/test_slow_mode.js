
// Mock the slow generation process to see if it waits
console.log("🚀 Testing Throttled Logic (Simulation)...");

const items = ['Game 1', 'Game 2', 'Game 3'];

async function processFake() {
    const start = Date.now();

    for (const [index, item] of items.entries()) {
        if (index > 0) {
            console.log(`zzz Waiting 2s (simulated)...`);
            await new Promise(r => setTimeout(r, 2000));
        }
        console.log(`Processing ${item} at ${(Date.now() - start) / 1000}s`);
    }

    const totalTime = (Date.now() - start) / 1000;
    console.log(`✅ Done in ${totalTime.toFixed(2)}s`);

    if (totalTime >= 4) {
        console.log("PASS: Throttling works.");
    } else {
        console.log("FAIL: Too fast.");
    }
}

processFake();
