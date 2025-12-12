const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuração do .env.local...\n');

const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
    console.log('❌ Arquivo .env.local não encontrado!');
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

// Variáveis para verificar
const requiredVars = {
    'NEXT_PUBLIC_SUPABASE_URL': { required: true, configured: false },
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': { required: true, configured: false },
    'MONGODB_URI': { required: true, configured: false },
    'GOOGLE_API_KEY': { required: true, configured: false },
    'NEXT_PUBLIC_BASE_URL': { required: true, configured: false }
};

const optionalVars = {
    'REDIS_URL': { configured: false },
    'EVOLUTION_API_URL': { configured: false },
    'EVOLUTION_API_KEY': { configured: false },
    'META_ACCESS_TOKEN': { configured: false },
    'FACEBOOK_ACCESS_TOKEN': { configured: false },
    'RESEND_API_KEY': { configured: false },
    'GOOGLE_CX': { configured: false }
};

// Verificar variáveis
lines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        const trimmedKey = key.trim();
        const trimmedValue = value.trim();

        if (requiredVars[trimmedKey]) {
            requiredVars[trimmedKey].configured = trimmedValue.length > 0 && !trimmedValue.startsWith('your_');
        }
        if (optionalVars[trimmedKey]) {
            optionalVars[trimmedKey].configured = trimmedValue.length > 0 && !trimmedValue.startsWith('your_');
        }
    }
});

// Exibir resultados
console.log('📋 VARIÁVEIS OBRIGATÓRIAS:\n');
let allRequired = true;
for (const [key, info] of Object.entries(requiredVars)) {
    const status = info.configured ? '✅' : '❌';
    console.log(`   ${status} ${key}`);
    if (!info.configured) allRequired = false;
}

console.log('\n💡 VARIÁVEIS OPCIONAIS:\n');
for (const [key, info] of Object.entries(optionalVars)) {
    const status = info.configured ? '✅' : '⚠️ ';
    console.log(`   ${status} ${key}`);
}

console.log('\n' + '='.repeat(60));
if (allRequired) {
    console.log('\n🎉 CONFIGURAÇÃO COMPLETA! Todas as variáveis obrigatórias estão configuradas.');
    console.log('\n✅ Você pode executar o projeto com: npm run dev\n');
} else {
    console.log('\n⚠️  CONFIGURAÇÃO INCOMPLETA!');
    console.log('\n📝 Variáveis pendentes:');
    for (const [key, info] of Object.entries(requiredVars)) {
        if (!info.configured) {
            console.log(`   - ${key}`);
        }
    }
    console.log('\n💡 Consulte SETUP_STATUS.md para instruções de como obter essas credenciais.\n');
}
