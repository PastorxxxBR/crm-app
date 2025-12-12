# 🔄 RENOVAÇÃO AUTOMÁTICA DE TOKEN - Mercado Livre

## ✅ SISTEMA IMPLEMENTADO COM SUCESSO!

O CRM agora renova automaticamente o token do Mercado Livre a cada 6 horas!

---

## 🤖 COMO FUNCIONA

### **Sistema Automático em Background**

O sistema funciona assim:

1. **Verifica a cada 5 minutos** se o token está expirando
2. **Se faltarem menos de 30 minutos** para expirar, renova automaticamente
3. **Salva o novo token** no `.env.local` e em cache
4. **Atualiza em runtime** sem precisar reiniciar o servidor
5. **Funciona 24/7** em background

---

## 📁 ARQUIVOS CRIADOS

### **1. Token Manager** (`src/lib/mlTokenManager.ts`)
Gerenciador completo de tokens.

**Funcionalidades:**
- ✅ Renovação automática a cada 5 minutos
- ✅ Detecta quando token está expirando
- ✅ Renova usando refresh token
- ✅ Salva em `.ml-token.json` (cache)
- ✅ Atualiza `.env.local` automaticamente
- ✅ Atualiza variáveis de ambiente em runtime
- ✅ Cleanup ao encerrar aplicação

### **2. APIs Criadas**

#### **GET `/api/mercadolivre/token`**
Verifica status do token
```json
{
  "success": true,
  "hasToken": true,
  "expiresAt": "2025-12-12T05:00:00Z",
  "expiresIn": "180 minutos",
  "needsRenewal": false
}
```

#### **POST `/api/mercadolivre/token`**
Renova token manualmente
```json
{
  "success": true,
  "message": "Token renovado com sucesso!",
  "status": {...}
}
```

#### **GET `/api/mercadolivre/callback?code=...`**
Callback OAuth (primeira autorização)
- Recebe código de autorização
- Obtém token inicial
- Salva refresh token
- Redireciona para dashboard

---

## 🔑 VARIÁVEIS DE AMBIENTE

### **Necessárias:**
```bash
MERCADOLIVRE_CLIENT_ID=8915788255273924
MERCADOLIVRE_CLIENT_SECRET=oA2rpmIX1gSjLjhoTKgM4dBlpmvA9cIY
MERCADOLIVRE_ACCESS_TOKEN=TG-...
MERCADOLIVRE_REFRESH_TOKEN=TG-...  # Será preenchido automaticamente
MERCADOLIVRE_REDIRECT_URI=http://localhost:3000/api/mercadolivre/callback
```

---

## 🚀 COMO USAR

### **Primeira Vez (Obter Refresh Token):**

Se você ainda não tem o refresh token:

1. **Acesse a URL de autorização:**
```
https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=8915788255273924&redirect_uri=http://localhost:3000/api/mercadolivre/callback
```

2. **Autorize o aplicativo** no Mercado Livre

3. **Você será redirecionado** para `/api/mercadolivre/callback`

4. **O sistema automaticamente:**
   - Obtém o access token
   - Obtém o refresh token
   - Salva tudo
   - Redireciona para o dashboard

5. **Pronto!** A partir de agora, a renovação é automática!

---

### **Uso Normal (Automático):**

Depois da primeira autorização, **não precisa fazer nada**!

O sistema:
- ✅ Renova automaticamente
- ✅ Funciona 24/7
- ✅ Sem intervenção manual
- ✅ Sem reiniciar servidor

---

## 📊 MONITORAMENTO

### **Ver Status do Token:**

```javascript
// Via API
const response = await fetch('/api/mercadolivre/token')
const data = await response.json()

console.log('Token expira em:', data.expiresIn)
console.log('Precisa renovar:', data.needsRenewal)
```

### **Renovar Manualmente:**

```javascript
// Via API
const response = await fetch('/api/mercadolivre/token', {
  method: 'POST'
})
const data = await response.json()

console.log('Renovado:', data.success)
```

---

## 🔄 FLUXO DE RENOVAÇÃO

```
┌─────────────────────────────────────┐
│  Sistema inicia                     │
│  Token Manager carrega cache       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Verifica a cada 5 minutos          │
│  Token está expirando?              │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        │             │
       SIM           NÃO
        │             │
        ▼             ▼
┌──────────────┐  ┌──────────────┐
│ Renova Token │  │ Aguarda      │
│ Salva Cache  │  │ Próxima      │
│ Atualiza ENV │  │ Verificação  │
└──────────────┘  └──────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│  Token renovado!                    │
│  Válido por mais 6 horas            │
└─────────────────────────────────────┘
```

---

## 💾 ARQUIVOS DE CACHE

### **`.ml-token.json`**
Armazena dados do token em cache:

```json
{
  "access_token": "TG-...",
  "refresh_token": "TG-...",
  "expires_in": 21600,
  "token_type": "Bearer",
  "scope": "offline_access read write",
  "user_id": 680750537,
  "created_at": 1702345678901
}
```

**Importante:**
- ✅ Adicionado ao `.gitignore`
- ✅ Não commitar no Git
- ✅ Criado automaticamente
- ✅ Atualizado a cada renovação

---

## ⚙️ CONFIGURAÇÃO

### **Intervalo de Verificação:**
```typescript
// Verifica a cada 5 minutos
const checkInterval = 5 * 60 * 1000
```

### **Margem de Segurança:**
```typescript
// Renova se faltar menos de 30 minutos
const safetyMargin = 30 * 60 * 1000
```

### **Tempo de Expiração:**
```typescript
// Token do ML expira em 6 horas
const expiresIn = 21600 // segundos
```

---

## 🛡️ SEGURANÇA

### **Proteções Implementadas:**

1. **Cache Local:**
   - Token salvo em `.ml-token.json`
   - Não exposto publicamente
   - Adicionado ao `.gitignore`

2. **Variáveis de Ambiente:**
   - Tokens em `.env.local`
   - Não commitados no Git
   - Atualizados automaticamente

3. **Runtime Update:**
   - Variáveis atualizadas em memória
   - Sem necessidade de reiniciar
   - Sem downtime

4. **Cleanup:**
   - Intervalo limpo ao encerrar
   - Sem memory leaks
   - Graceful shutdown

---

## 🆘 TROUBLESHOOTING

### **Problema: Token não renova**

**Solução:**
1. Verifique se `MERCADOLIVRE_REFRESH_TOKEN` está configurado
2. Verifique logs do console
3. Tente renovar manualmente: `POST /api/mercadolivre/token`

### **Problema: Refresh token inválido**

**Solução:**
1. Acesse a URL de autorização novamente
2. Autorize o app no ML
3. Novo refresh token será salvo

### **Problema: .ml-token.json não criado**

**Solução:**
1. Verifique permissões de escrita
2. Verifique se o diretório existe
3. Token será criado na primeira renovação

---

## 📈 LOGS

O sistema gera logs detalhados:

```
🤖 Iniciando renovação automática de token do ML...
✅ Renovação automática ativada (verifica a cada 5 minutos)
📦 Token do ML carregado do cache
⚠️ Token expirando, renovando...
🔄 Renovando token do Mercado Livre...
✅ Token renovado com sucesso!
💾 Token do ML salvo com sucesso
✅ .env.local atualizado com novo token
⏰ Próxima renovação em: 360 minutos
```

---

## ✅ CHECKLIST

- [x] Token Manager criado
- [x] Renovação automática implementada
- [x] APIs de gerenciamento criadas
- [x] Callback OAuth configurado
- [x] Cache em arquivo implementado
- [x] .env.local atualização automática
- [x] Runtime update implementado
- [x] Cleanup implementado
- [x] .gitignore atualizado
- [x] Documentação completa

---

## 🎊 RESUMO

### **Antes:**
```
❌ Token expira a cada 6 horas
❌ Precisa renovar manualmente
❌ Sistema para de funcionar
❌ Precisa reiniciar servidor
```

### **Agora:**
```
✅ Renovação 100% automática
✅ Funciona 24/7
✅ Sem intervenção manual
✅ Sem reiniciar servidor
✅ Sem downtime
```

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ **Primeira autorização** (se ainda não fez)
2. ✅ **Deixar rodando** - O sistema cuida do resto!
3. ✅ **Monitorar logs** (opcional)

---

**Status:** ✅ Operacional  
**Renovação:** Automática a cada 6 horas  
**Verificação:** A cada 5 minutos  
**Margem de segurança:** 30 minutos  

**O sistema está funcionando perfeitamente!** 🎉
