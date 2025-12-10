// scripts/run-migrations.ts
import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = 'https://urisspjzqickpatpvslg.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function runMigrations() {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');
    const files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    console.log(`Found ${files.length} migration files`);

    for (const file of files) {
        console.log(`\nRunning migration: ${file}`);
        const filePath = join(migrationsDir, file);
        const sql = readFileSync(filePath, 'utf-8');

        try {
            // Execute the SQL directly
            const { error } = await supabase.rpc('exec_sql', { sql_query: sql }).single();

            if (error) {
                console.error(`❌ Error in ${file}:`, error.message);
                // Try direct execution as fallback
                console.log('Attempting direct execution...');
                const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_SERVICE_ROLE_KEY,
                        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ sql_query: sql })
                });

                if (!response.ok) {
                    console.error(`❌ Failed: ${await response.text()}`);
                } else {
                    console.log(`✅ Success (via direct API)`);
                }
            } else {
                console.log(`✅ Success`);
            }
        } catch (err: any) {
            console.error(`❌ Exception in ${file}:`, err.message);
            console.log('SQL content:', sql.substring(0, 200) + '...');
        }
    }

    console.log('\n🎉 Migration process completed!');
}

runMigrations().catch(console.error);
