const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
const outputFile = path.join(__dirname, '..', 'supabase', 'consolidated-migrations.sql');

const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

let consolidated = `-- Consolidated Migrations for Supabase\n`;
consolidated += `-- Project: urisspjzqickpatpvslg\n`;
consolidated += `-- Generated: ${new Date().toISOString()}\n`;
consolidated += `-- Total migrations: ${files.length}\n\n`;

files.forEach(file => {
    const content = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    consolidated += `\n\n-- ========================================\n`;
    consolidated += `-- Migration: ${file}\n`;
    consolidated += `-- ========================================\n\n`;
    consolidated += content;
});

fs.writeFileSync(outputFile, consolidated);
console.log(`✅ Consolidated ${files.length} migrations into:`);
console.log(`   ${outputFile}`);
console.log(`\n📋 Next steps:`);
console.log(`   1. Open https://supabase.com/dashboard/project/urisspjzqickpatpvslg/sql`);
console.log(`   2. Copy the contents of supabase/consolidated-migrations.sql`);
console.log(`   3. Paste into the SQL editor and click "Run"`);
