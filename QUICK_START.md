# 🚀 GUIA RÁPIDO - Como Começar

## ⚡ Setup em 5 Minutos

### 1️⃣ Configure as Variáveis de Ambiente (2 min)

```bash
# Copie o arquivo de exemplo
cp .env.example .env.local
```

Edite `.env.local` e preencha:

```bash
# OBRIGATÓRIAS (sem elas o app não funciona)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/crm_db
GOOGLE_API_KEY=sua_chave_gemini_aqui
NEXT_PUBLIC_BASE_URL=http://localhost:3001
```

### 2️⃣ Instale e Execute (3 min)

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev
```

Acesse: **http://localhost:3001**

---

## 🔑 Como Obter as Credenciais

### Supabase (Gratuito)
1. Acesse: https://supabase.com
2. Crie conta → Novo projeto
3. Settings → API → Copie URL e anon key

### MongoDB (Gratuito)
1. Acesse: https://www.mongodb.com/cloud/atlas
2. Crie conta → Novo cluster (M0 Free)
3. Database Access → Criar usuário
4. Network Access → Adicionar IP (0.0.0.0/0 para dev)
5. Connect → Copie connection string

### Google Gemini AI (Gratuito)
1. Acesse: https://makersuite.google.com/app/apikey
2. Crie API Key
3. Copie a chave

---

## 📱 Primeiros Passos no App

### 1. Criar Conta
- Acesse `/login`
- Clique em "Sign Up"
- Use email e senha

### 2. Explorar Dashboard
- Acesse `/admin`
- Veja métricas e gráficos
- Explore os agentes

### 3. Testar Caixa
- Acesse `/cash-register`
- Abra um caixa
- Registre vendas

---

## ⚠️ Features Opcionais (Pode Configurar Depois)

### Redis (Cache)
- **Necessário?** Não
- **Para que?** Melhorar performance
- **Como?** Instale Redis local ou use Upstash

### WhatsApp (Evolution API)
- **Necessário?** Não
- **Para que?** Enviar mensagens WhatsApp
- **Como?** Configure Evolution API

### Facebook/Instagram
- **Necessário?** Não
- **Para que?** Integração social
- **Como?** Obtenha Meta Access Token

---

## 🆘 Problemas Comuns

### ❌ "Failed to fetch" no login
**Solução:** Verifique se SUPABASE_URL e SUPABASE_ANON_KEY estão corretos

### ❌ "MongoDB connection failed"
**Solução:** Verifique MONGODB_URI e se IP está liberado no Atlas

### ⚠️ "Redis connection refused"
**Solução:** Normal! Redis é opcional. App funciona sem ele.

### ⚠️ "Evolution API not configured"
**Solução:** Normal! WhatsApp é opcional. Ignore se não usar.

---

## 📚 Documentação Completa

- **README.md** - Guia completo do projeto
- **ANALYSIS_REPORT.md** - Análise detalhada
- **FIXES_SUMMARY.md** - Correções aplicadas
- **QUICK_START.md** - Este arquivo

---

## 🎯 Próximos Passos

1. ✅ Configure variáveis obrigatórias
2. ✅ Execute `npm run dev`
3. ✅ Crie sua conta
4. ✅ Explore o dashboard
5. ⚠️ Configure features opcionais (quando precisar)

---

**Dúvidas?** Consulte o README.md ou ANALYSIS_REPORT.md

**Pronto para começar!** 🚀
