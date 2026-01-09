const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const newKey = '39527cb5529d564d2bf7ebd5f325d043';

try {
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Check if API_FOOTBALL_KEY exists
    if (envContent.includes('API_FOOTBALL_KEY=')) {
        envContent = envContent.replace(
            /API_FOOTBALL_KEY=(.*)/,
            (match, currentVal) => {
                // If current val is empty or default loop, just replace. 
                // If it has a value, append with comma for rotation
                const existing = currentVal.trim().replace(/"/g, '');
                if (existing && existing.length > 10 && !existing.includes(newKey)) {
                    return `API_FOOTBALL_KEY="${newKey},${existing}"`; // Newest first
                }
                return `API_FOOTBALL_KEY="${newKey}"`;
            }
        );
    } else {
        envContent += `\nAPI_FOOTBALL_KEY="${newKey}"\n`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Updated API_FOOTBALL_KEY in .env');

    // Verify
    const verify = fs.readFileSync(envPath, 'utf8');
    const match = verify.match(/API_FOOTBALL_KEY=(.*)/);
    console.log('Current Keys:', match ? match[1] : 'None');

} catch (e) {
    console.error('Error updating .env:', e);
}
