const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), 'server', '.env'); // Explicit path
const newKey = '73fa7b81181efafeb63e211253c6452d';

try {
    if (!fs.existsSync(envPath)) {
        console.error("Env file not found at " + envPath);
        process.exit(1);
    }

    let envContent = fs.readFileSync(envPath, 'utf8');

    if (envContent.includes('API_FOOTBALL_KEY=')) {
        envContent = envContent.replace(
            /API_FOOTBALL_KEY=(.*)/,
            (match, currentVal) => {
                const existing = currentVal.trim().replace(/"/g, '');
                if (existing.includes(newKey)) return match;
                if (existing.length > 10) {
                    return `API_FOOTBALL_KEY="${newKey},${existing}"`;
                }
                return `API_FOOTBALL_KEY="${newKey}"`;
            }
        );
    } else {
        envContent += `\nAPI_FOOTBALL_KEY="${newKey}"\n`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Added 3rd Key to .env');

} catch (e) {
    console.error('Error:', e);
}
