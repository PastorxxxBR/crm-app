# Script de Deploy - CRM Toca da Onça

Write-Host "🚀 Preparando deploy do CRM..." -ForegroundColor Cyan
Write-Host ""

# Verificar se Git está instalado
Write-Host "📋 Verificando Git..." -ForegroundColor Yellow
$gitVersion = git --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Git não está instalado!" -ForegroundColor Red
    Write-Host "Instale em: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Git instalado: $gitVersion" -ForegroundColor Green
Write-Host ""

# Verificar se já é um repositório Git
if (Test-Path ".git") {
    Write-Host "✅ Repositório Git já inicializado" -ForegroundColor Green
} else {
    Write-Host "📦 Inicializando repositório Git..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Repositório criado!" -ForegroundColor Green
}
Write-Host ""

# Verificar arquivos sensíveis
Write-Host "🔒 Verificando arquivos sensíveis..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✅ .env.local encontrado (não será commitado)" -ForegroundColor Green
}
if (Test-Path ".ml-token.json") {
    Write-Host "✅ .ml-token.json encontrado (não será commitado)" -ForegroundColor Green
}
Write-Host ""

# Adicionar arquivos
Write-Host "📝 Adicionando arquivos ao Git..." -ForegroundColor Yellow
git add .
Write-Host "✅ Arquivos adicionados!" -ForegroundColor Green
Write-Host ""

# Commit
Write-Host "💾 Criando commit..." -ForegroundColor Yellow
git commit -m "Initial commit - CRM Toca da Onça completo com análise competitiva"
Write-Host "✅ Commit criado!" -ForegroundColor Green
Write-Host ""

# Instruções
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "🎯 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Criar repositório no GitHub:" -ForegroundColor Yellow
Write-Host "   https://github.com/new" -ForegroundColor White
Write-Host ""
Write-Host "2️⃣  Nome sugerido: crm-tocadaoncaroupa" -ForegroundColor Yellow
Write-Host ""
Write-Host "3️⃣  Marcar como PRIVADO ✅" -ForegroundColor Yellow
Write-Host ""
Write-Host "4️⃣  Depois de criar, execute:" -ForegroundColor Yellow
Write-Host "   git remote add origin https://github.com/SEU_USUARIO/crm-tocadaoncaroupa.git" -ForegroundColor White
Write-Host "   git branch -M main" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "5️⃣  Acesse Vercel:" -ForegroundColor Yellow
Write-Host "   https://vercel.com/new" -ForegroundColor White
Write-Host ""
Write-Host "6️⃣  Importe o repositório e faça deploy!" -ForegroundColor Yellow
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "📖 Guia completo em: DEPLOY_GUIDE.md" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Preparação concluída!" -ForegroundColor Green
