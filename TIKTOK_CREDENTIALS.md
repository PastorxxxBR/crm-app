# 🎵 CREDENCIAIS TIKTOK - CONFIGURAÇÃO

## ✅ CREDENCIAIS ENCONTRADAS

Baseado nas imagens fornecidas:

### **1. Chave do Aplicativo (App Key)**
```
6idbp5r6bj79
```

### **2. Segredo do Aplicativo (App Secret)**
```
3bb2845a3084cdedaf30410e387135960c9755df
```

### **3. Shop ID**
```
7561074599025346325
```

### **4. URL de Redirecionamento**
```
https://tocadaoncamodas.com.br/
```

---

## 📝 ADICIONE NO `.env.local`

Abra o arquivo `.env.local` e adicione estas linhas:

```bash
# TikTok Shopping API
TIKTOK_APP_KEY=6idbp5r6bj79
TIKTOK_APP_SECRET=3bb2845a3084cdedaf30410e387135960c9755df
TIKTOK_SHOP_ID=7561074599025346325
TIKTOK_REDIRECT_URI=https://tocadaoncamodas.com.br/
```

---

## 🔑 FALTA: ACCESS TOKEN

O **Access Token** precisa ser gerado via OAuth.

### **Como gerar:**

1. **Acesse:** https://partner.tiktokshop.com/
2. **Vá em:** "Gerenciar API"
3. **Clique em:** "Copiar link de autorização"
4. **Abra o link** no navegador
5. **Autorize** o aplicativo
6. **Copie o código** que aparece na URL
7. **Use o código** para gerar o token

### **Ou use a Ferramenta de Teste:**

Na página do TikTok Partner Center, você viu:
> "Use a Ferramenta de teste de API para testar APIs"

1. Clique nesse link
2. Gere um token de teste
3. Copie o token

---

## 🚀 DEPOIS DE ADICIONAR

1. **Reinicie o servidor:**
```bash
# Pare (Ctrl+C)
npm run dev
```

2. **Acesse:**
```
http://localhost:3000/admin/tiktok
```

3. **Teste a conexão!**

---

## 📋 ARQUIVO .env.local COMPLETO

Seu arquivo deve ficar assim:

```bash
# Google APIs
GOOGLE_API_KEY=AIzaSyDlR9cW_YlOGbH0kKQGvPEu-CxqJLEYqhY
GOOGLE_CX=26a560df0bbc74234
GOOGLE_MERCHANT_CENTER_ID=699242218

# Mercado Livre
MERCADOLIVRE_CLIENT_ID=8915788255273924
MERCADOLIVRE_CLIENT_SECRET=oA2rpmIX1gSjLjhoTKgM4dBlpmvA9cIY
MERCADOLIVRE_ACCESS_TOKEN=TG-693b75be7d7388000195d127-680750537
MERCADOLIVRE_REFRESH_TOKEN=
MERCADOLIVRE_REDIRECT_URI=https://crm.tocadaoncaroupa.com/api/mercadolivre/callback

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://yjvdqtqxfqwqwbxgmjdm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqdmRxdHF4ZnF3cXdieGdtamRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1MTQ2NTQsImV4cCI6MjA0OTA5MDY1NH0.rBzCVGpQjGQUEQEZKdGGjUXDmYcYpMGLOCdUCXSPOlY

# MongoDB
MONGODB_URI=mongodb+srv://pastorxxxbr:Deus123456@cluster0.ywmjd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# Base URL
NEXT_PUBLIC_BASE_URL=https://crm.tocadaoncaroupa.com

# TikTok Shopping (ADICIONAR ESTAS LINHAS)
TIKTOK_APP_KEY=6idbp5r6bj79
TIKTOK_APP_SECRET=3bb2845a3084cdedaf30410e387135960c9755df
TIKTOK_SHOP_ID=7561074599025346325
TIKTOK_REDIRECT_URI=https://tocadaoncamodas.com.br/
TIKTOK_ACCESS_TOKEN=SEU_TOKEN_AQUI
```

---

## ⚠️ IMPORTANTE

O **TIKTOK_ACCESS_TOKEN** é obrigatório para a integração funcionar!

**Próximo passo:**
1. Gere o Access Token
2. Adicione no .env.local
3. Reinicie o servidor
4. Teste!

---

**Quer que eu te ajude a gerar o Access Token?** 🔑
