
// Helper to append to .env
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), 'server', '.env');
let envContent = fs.readFileSync(envPath, 'utf8');

if (!envContent.includes('OVERRIDE_DATE')) {
    envContent += '\nOVERRIDE_DATE=2025-01-08\n';
    fs.writeFileSync(envPath, envContent);
    console.log("Updated .env with OVERRIDE_DATE=2025-01-08");
} else {
    // Update existing
    envContent = envContent.replace(/OVERRIDE_DATE=.*/, 'OVERRIDE_DATE=2025-01-08');
    fs.writeFileSync(envPath, envContent);
    console.log("Updated existing OVERRIDE_DATE.");
}
