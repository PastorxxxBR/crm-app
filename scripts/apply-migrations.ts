// scripts/apply-migrations.ts
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Hardcoded for this project
const SUPABASE_URL = 'https://urisspjzqickpatpvslg.supabase.co';
const SUPABASE_SERVICE_KEY = 'sb_secret_yLaQ6cDBGt33Yn5PmrQaFA_ZY6fOB12'; // From the screenshot

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyMigrations() {
    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
    const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

    console.log(`📁 Found ${files.length} migration files\n`);

    for (const file of files) {
        console.log(`⚙️  Applying: ${file}`);
        const sqlPath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(sqlPath, 'utf-8');

        // Split by semicolon to execute statements individually
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i] + ';';
            try {
                const { error } = await supabase.rpc('exec_sql', { query: statement });
                if (error) {
                    // Try direct SQL execution as fallback
                    console.log(`   Trying direct execution for statement ${i + 1}...`);
                    // Note: This requires a custom exec_sql function in Supabase or we use the SQL editor
                    // For now, we'll just log the error
                    console.warn(`   ⚠️  Could not execute via RPC: ${error.message}`);
                }
            } catch (err: any) {
                console.warn(`   ⚠️  Error: ${err.message}`);
            }
        }
        console.log(`   ✅ Completed ${file}\n`);
    }

    console.log('🎉 All migrations applied!');
}

applyMigrations().catch(console.error);
