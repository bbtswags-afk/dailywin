const fs = require('fs');
const path = require('path');

// Usage: node update_groq_key.js "YOUR_NEW_KEY_HERE"

const envPath = path.join(process.cwd(), '.env'); // Assumed running from server/ root
const newKey = process.argv[2];

if (!newKey) {
    console.error("❌ Usage: node update_groq_key.js \"YOUR_KEY_HERE\"");
    process.exit(1);
}

try {
    if (!fs.existsSync(envPath)) {
        console.error("❌ .env file not found!");
        process.exit(1);
    }

    let envContent = fs.readFileSync(envPath, 'utf8');

    if (envContent.includes('GROQ_API_KEY=')) {
        envContent = envContent.replace(
            /GROQ_API_KEY=(.*)/,
            (match, currentVal) => {
                let existing = currentVal.trim().replace(/"/g, '');

                // If it's the default/placeholder, just replace it
                if (existing.includes('gsk_YOUR_KEY')) {
                    return `GROQ_API_KEY="${newKey}"`;
                }

                // If input key is already there, do nothing
                if (existing.includes(newKey)) {
                    console.log("ℹ️ Key already exists.");
                    return match;
                }

                // Append with comma
                return `GROQ_API_KEY="${existing},${newKey}"`;
            }
        );
    } else {
        envContent += `\nGROQ_API_KEY="${newKey}"\n`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Successfully added key to rotation pool.`);

    // Verify
    const verify = fs.readFileSync(envPath, 'utf8');
    const finalKeys = verify.match(/GROQ_API_KEY=(.*)/)[1].replace(/"/g, '');
    const count = finalKeys.split(',').length;
    console.log(`   -> You now have ${count} key(s) configured.`);

} catch (e) {
    console.error('Error updating .env:', e);
}
