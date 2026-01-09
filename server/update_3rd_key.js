const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const newKey = '73fa7b81181efafeb63e211253c6452d';

try {
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Check if API_FOOTBALL_KEY exists
    if (envContent.includes('API_FOOTBALL_KEY=')) {
        envContent = envContent.replace(
            /API_FOOTBALL_KEY=(.*)/,
            (match, currentVal) => {
                const existing = currentVal.trim().replace(/"/g, '');
                // Avoid duplicates
                if (existing.includes(newKey)) return match;

                // Append
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

    // Verify
    const verify = fs.readFileSync(envPath, 'utf8');
    const match = verify.match(/API_FOOTBALL_KEY=(.*)/);
    console.log('Current Keys:', match ? match[1] : 'None');

} catch (e) {
    console.error('Error updating .env:', e);
}
