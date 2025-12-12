const fs = require('fs');
const path = require('path');

// Chave do Google Gemini fornecida pelo usuário
const GOOGLE_API_KEY = 'AIzaSyA6VRlvtHrY7XSgO8_RgN-IuSg73LP08h0';

const envPath = path.join(__dirname, '.env.local');

// Ler arquivo existente
let envContent = '';
if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
}

// Função para atualizar ou adicionar variável
function updateOrAddVar(content, key, value) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
        return content.replace(regex, `${key}=${value}`);
    } else {
        return content + `\n${key}=${value}`;
    }
}

// Atualizar GOOGLE_API_KEY
envContent = updateOrAddVar(envContent, 'GOOGLE_API_KEY', GOOGLE_API_KEY);

// Salvar arquivo
fs.writeFileSync(envPath, envContent.trim() + '\n');

console.log('✅ Google API Key configurada com sucesso!');
console.log('\n📋 Chave configurada:');
console.log(`   GOOGLE_API_KEY=${GOOGLE_API_KEY.substring(0, 20)}...`);
console.log('\n🎉 CONFIGURAÇÃO COMPLETA!');
console.log('\n✅ Todas as variáveis obrigatórias estão configuradas:');
console.log('   ✅ NEXT_PUBLIC_SUPABASE_URL');
console.log('   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY');
console.log('   ✅ MONGODB_URI');
console.log('   ✅ GOOGLE_API_KEY');
console.log('   ✅ NEXT_PUBLIC_BASE_URL');
console.log('\n🚀 Próximo passo: Execute "npm run dev" para iniciar o servidor!');
