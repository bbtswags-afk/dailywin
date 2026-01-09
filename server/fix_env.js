import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');

const newKeys = [
    '73fa7b81181efafeb63e211253c6452d',
    '39527cb5529d564d2bf7ebd5f325d043'
];

try {
    let content = fs.readFileSync(envPath, 'utf8');
    console.log("ORIGINAL CONTENT:\n", content);

    // Remove existing KEY lines
    let lines = content.split('\n');
    let otherLines = lines.filter(l => !l.startsWith('API_FOOTBALL_KEY='));

    const finalKeyLine = `API_FOOTBALL_KEY="${newKeys.join(',')}"`;

    const newContent = [...otherLines, finalKeyLine].join('\n');

    fs.writeFileSync(envPath, newContent);
    console.log("✅ FIXED .env CONTENT:\n", newContent);

} catch (e) {
    console.error(e);
}
