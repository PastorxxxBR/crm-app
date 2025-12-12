# 🚀 DEPLOY DO CRM - Guia Completo

## ✅ PASSO A PASSO PARA SUBIR O CRM

---

## 📋 PRÉ-REQUISITOS

- [x] Domínio: tocadaoncaroupa.com (Cloudflare)
- [x] Projeto CRM pronto
- [ ] Conta Vercel (gratuita)
- [ ] Conta GitHub (gratuita)

---

## 🎯 SUBDOMÍNIO RECOMENDADO

```
crm.tocadaoncaroupa.com
```

ou

```
admin.tocadaoncaroupa.com
```

ou

```
painel.tocadaoncaroupa.com
```

**Escolha qual você prefere!**

---

## 📝 PASSO 1: PREPARAR O PROJETO

### **1.1 - Criar arquivo de build**

Já está pronto! Seu `package.json` tem:
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```

### **1.2 - Verificar variáveis de ambiente**

Seu `.env.local` tem:
```bash
GOOGLE_API_KEY=...
GOOGLE_CX=...
GOOGLE_MERCHANT_CENTER_ID=...
MERCADOLIVRE_CLIENT_ID=...
MERCADOLIVRE_CLIENT_SECRET=...
MERCADOLIVRE_ACCESS_TOKEN=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
MONGODB_URI=...
```

**Você vai precisar adicionar essas no Vercel!**

---

## 🌐 PASSO 2: CRIAR REPOSITÓRIO NO GITHUB

### **2.1 - Inicializar Git (se ainda não fez)**

```bash
cd c:\Users\lenovo\Desktop\CRM\crm-app
git init
git add .
git commit -m "Initial commit - CRM completo"
```

### **2.2 - Criar repositório no GitHub**

1. Acesse: https://github.com/new
2. Nome: `crm-tocadaoncaroupa`
3. Privado: ✅ (recomendado)
4. Clique em "Create repository"

### **2.3 - Conectar e enviar**

```bash
git remote add origin https://github.com/SEU_USUARIO/crm-tocadaoncaroupa.git
git branch -M main
git push -u origin main
```

---

## 🚀 PASSO 3: DEPLOY NA VERCEL

### **3.1 - Criar conta Vercel**

1. Acesse: https://vercel.com/signup
2. Clique em "Continue with GitHub"
3. Autorize a Vercel

### **3.2 - Importar projeto**

1. No dashboard da Vercel, clique em "Add New..."
2. Selecione "Project"
3. Escolha o repositório `crm-tocadaoncaroupa`
4. Clique em "Import"

### **3.3 - Configurar projeto**

**Framework Preset:** Next.js (detectado automaticamente)

**Build Command:** `npm run build`

**Output Directory:** `.next`

**Install Command:** `npm install`

### **3.4 - Adicionar variáveis de ambiente**

Clique em "Environment Variables" e adicione:

```
GOOGLE_API_KEY = sua_chave_aqui
GOOGLE_CX = 26a560df0bbc74234
GOOGLE_MERCHANT_CENTER_ID = 699242218
MERCADOLIVRE_CLIENT_ID = 8915788255273924
MERCADOLIVRE_CLIENT_SECRET = oA2rpmIX1gSjLjhoTKgM4dBlpmvA9cIY
MERCADOLIVRE_ACCESS_TOKEN = TG-693b75be7d7388000195d127-680750537
MERCADOLIVRE_REFRESH_TOKEN = (deixe vazio por enquanto)
NEXT_PUBLIC_SUPABASE_URL = sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY = sua_chave_supabase
MONGODB_URI = sua_uri_mongodb
NEXT_PUBLIC_BASE_URL = https://crm.tocadaoncaroupa.com
```

**IMPORTANTE:** Marque todas como "Production", "Preview" e "Development"

### **3.5 - Deploy!**

Clique em **"Deploy"**

Aguarde ~2-5 minutos...

✅ **Deploy concluído!**

Você receberá uma URL tipo: `crm-tocadaoncaroupa.vercel.app`

---

## 🌐 PASSO 4: CONFIGURAR DOMÍNIO CUSTOMIZADO

### **4.1 - Na Vercel**

1. Vá em "Settings" do projeto
2. Clique em "Domains"
3. Adicione: `crm.tocadaoncaroupa.com`
4. Clique em "Add"

A Vercel vai mostrar os registros DNS necessários:

```
Type: CNAME
Name: crm
Value: cname.vercel-dns.com
```

### **4.2 - No Cloudflare**

1. Acesse: https://dash.cloudflare.com/
2. Selecione `tocadaoncaroupa.com`
3. Vá em "DNS" → "Records"
4. Clique em "Add record"

**Configuração:**
```
Type: CNAME
Name: crm
Target: cname.vercel-dns.com
Proxy status: DNS only (cinza, não laranja)
TTL: Auto
```

5. Clique em "Save"

### **4.3 - Aguardar propagação**

Aguarde 5-10 minutos...

Teste: https://crm.tocadaoncaroupa.com

✅ **Funcionando!**

---

## 🔒 PASSO 5: CONFIGURAR SSL (HTTPS)

### **No Cloudflare:**

1. Vá em "SSL/TLS"
2. Modo de criptografia: **"Full"** ou **"Full (strict)"**
3. Ative "Always Use HTTPS"
4. Ative "Automatic HTTPS Rewrites"

✅ **SSL configurado!**

---

## ⚡ PASSO 6: OTIMIZAÇÕES

### **6.1 - Cloudflare (Opcional)**

**Ativar:**
- Auto Minify (HTML, CSS, JS)
- Brotli
- HTTP/2
- HTTP/3

**Cache:**
- Browser Cache TTL: 4 horas

### **6.2 - Vercel**

Já otimizado automaticamente! ✅

---

## 🔄 PASSO 7: ATUALIZAÇÕES FUTURAS

### **Para atualizar o CRM:**

```bash
# Fazer mudanças no código
git add .
git commit -m "Descrição das mudanças"
git push

# A Vercel faz deploy automático!
```

✅ **Deploy automático configurado!**

---

## 📊 PASSO 8: MONITORAMENTO

### **Vercel Analytics (Gratuito)**

1. No projeto na Vercel
2. Vá em "Analytics"
3. Ative "Enable Analytics"

Você verá:
- Visitantes
- Páginas mais acessadas
- Performance
- Erros

---

## 🆘 TROUBLESHOOTING

### **Problema: Build falha**

**Solução:**
```bash
# Testar build localmente
npm run build

# Se funcionar, o problema é nas variáveis de ambiente
# Verifique se todas estão configuradas na Vercel
```

### **Problema: Domínio não resolve**

**Solução:**
1. Verifique se o CNAME está correto no Cloudflare
2. Proxy status deve estar em "DNS only" (cinza)
3. Aguarde até 24h para propagação completa

### **Problema: Erro 500**

**Solução:**
1. Vá em "Deployments" na Vercel
2. Clique no deployment com erro
3. Veja os logs em "Runtime Logs"
4. Geralmente é variável de ambiente faltando

---

## 📋 CHECKLIST FINAL

- [ ] Repositório GitHub criado
- [ ] Projeto enviado para GitHub
- [ ] Conta Vercel criada
- [ ] Projeto importado na Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado
- [ ] Domínio customizado adicionado
- [ ] DNS configurado no Cloudflare
- [ ] SSL ativado
- [ ] Site funcionando em https://crm.tocadaoncaroupa.com

---

## 🎯 RESULTADO FINAL

Seu CRM estará disponível em:

```
https://crm.tocadaoncaroupa.com
```

Com:
- ✅ HTTPS (SSL)
- ✅ Deploy automático
- ✅ Performance otimizada
- ✅ CDN global
- ✅ Monitoramento
- ✅ 100% gratuito!

---

## 💡 DICAS EXTRAS

### **Subdomínios adicionais:**

Você pode criar quantos quiser:

```
crm.tocadaoncaroupa.com     → Painel principal
api.tocadaoncaroupa.com     → API (se separar)
admin.tocadaoncaroupa.com   → Admin
vendas.tocadaoncaroupa.com  → Vendas
```

### **Ambientes:**

- **Production:** `crm.tocadaoncaroupa.com`
- **Preview:** `crm-tocadaoncaroupa-git-dev.vercel.app`
- **Development:** `localhost:3000`

---

## 🚀 COMANDOS RÁPIDOS

```bash
# Build local
npm run build

# Testar produção local
npm run start

# Deploy (automático no push)
git push

# Ver logs
vercel logs

# Ver domínios
vercel domains ls
```

---

**Pronto para fazer o deploy?** 🎯

**Comece pelo Passo 2!** 📝
