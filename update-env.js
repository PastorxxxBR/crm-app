const fs = require('fs');
const path = require('path');

// Credenciais do Supabase (das imagens fornecidas)
const SUPABASE_URL = 'https://yrcodjj84d04w10swegw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyc29kajg0ZDA0dzEwc3dlZ3ciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczMzk1NjQwMCwiZXhwIjoyMDQ5NTMyNDAwfQ.u6YnwAIb';

const envPath = path.join(__dirname, '.env.local');

// Ler arquivo existente ou criar novo
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

// Atualizar variáveis
envContent = updateOrAddVar(envContent, 'NEXT_PUBLIC_SUPABASE_URL', SUPABASE_URL);
envContent = updateOrAddVar(envContent, 'NEXT_PUBLIC_SUPABASE_ANON_KEY', SUPABASE_ANON_KEY);

// Adicionar outras variáveis se não existirem
const defaultVars = {
    'NEXT_PUBLIC_BASE_URL': 'http://localhost:3001',
    'NODE_ENV': 'development'
};

for (const [key, value] of Object.entries(defaultVars)) {
    if (!envContent.includes(`${key}=`)) {
        envContent += `\n${key}=${value}`;
    }
}

// Salvar arquivo
fs.writeFileSync(envPath, envContent.trim() + '\n');

console.log('✅ Variáveis de ambiente configuradas com sucesso!');
console.log('\n📋 Configurações aplicadas:');
console.log(`   NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}`);
console.log(`   NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY.substring(0, 50)}...`);
console.log('\n⚠️  IMPORTANTE: Você ainda precisa configurar:');
console.log('   - MONGODB_URI (obrigatório)');
console.log('   - GOOGLE_API_KEY (obrigatório)');
console.log('\n💡 Edite o arquivo .env.local para adicionar essas variáveis.');
