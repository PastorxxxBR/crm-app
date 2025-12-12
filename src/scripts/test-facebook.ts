
import { facebookService } from '../services/facebook';
import path from 'path';
const fs = require('fs');

// Manual env loading
const envPath = path.resolve(process.cwd(), '.env.local');
console.log('Loading env from:', envPath);
try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const lines = envFile.split('\n');
    for (const line of lines) {
        // Handle lines with multiple = correctly
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            if (key && !key.startsWith('#')) {
                process.env[key] = value;
            }
        }
    }
} catch (e) {
    console.error("Failed to read .env.local", e);
}

async function testFacebook() {
    try {
        console.log('Testing Facebook Integration...');
        // Debug token (first few chars)
        const token = process.env.FACEBOOK_ACCESS_TOKEN;
        console.log('Token available:', token ? token.substring(0, 10) + '...' : 'NO');

        const me = await facebookService.getMe();
        console.log('Me fetched');
        const accounts = await facebookService.getAccounts();
        console.log('Accounts fetched');

        fs.writeFileSync('facebook-result.json', JSON.stringify({ me, accounts }, null, 2));
        console.log('Done. Written to facebook-result.json');

    } catch (error: any) {
        console.error('Error:', error);
        fs.writeFileSync('facebook-error.json', JSON.stringify({ error: error.toString(), stack: error.stack }, null, 2));
    }
}

testFacebook();
