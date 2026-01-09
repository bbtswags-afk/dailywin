import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');

try {
    let content = fs.readFileSync(envPath, 'utf8');

    // Explicitly set the date to a busy football day
    // This allows the user to see "Real" predictions from the API
    const targetDate = "2025-01-04"; // Saturday

    if (content.includes("OVERRIDE_DATE=")) {
        content = content.replace(/OVERRIDE_DATE=.*/, `OVERRIDE_DATE=${targetDate}`);
    } else {
        content += `\nOVERRIDE_DATE=${targetDate}\n`;
    }

    fs.writeFileSync(envPath, content);
    console.log(`✅ Set OVERRIDE_DATE to ${targetDate}`);

} catch (e) {
    console.error(e);
}
