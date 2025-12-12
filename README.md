# 🚀 CRM Inteligente - Sistema Completo de Gestão

Sistema CRM avançado com inteligência artificial, integração com múltiplos serviços e automação de marketing.

## 📋 Índice

- [Características](#-características)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Uso](#-uso)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Agentes Inteligentes](#-agentes-inteligentes)
- [APIs Disponíveis](#-apis-disponíveis)

## ✨ Características

### 🤖 Agentes Inteligentes (14 agentes)
- **Marketing Agent** - Análise e otimização de campanhas
- **BI Agent** - Business Intelligence e análises
- **Security Agent** - Segurança e detecção de fraudes
- **Marketplaces Agent** - Gestão de marketplaces
- **Social Media Agent** - Gestão de redes sociais
- **Content Agent** - Criação de conteúdo
- **Email Marketing Agent** - Automação de email
- **Loyalty Agent** - Programa de fidelidade
- **Inventory Agent** - Gestão de estoque
- **Customer Service Agent** - Atendimento ao cliente
- **Cash Register Agent** - Sistema de caixa
- **Competitive Agent** - Análise competitiva
- **Trending Agent** - Análise de tendências
- **Integrations Agent** - Integrações externas

### 💼 Funcionalidades Principais
- ✅ **Dashboard Administrativo** - Visualizações e métricas em tempo real
- ✅ **Sistema de Caixa** - Controle de vendas e comissões
- ✅ **Autenticação Segura** - Supabase Auth
- ✅ **Campanhas de Marketing** - Criação e gestão automatizada
- ✅ **Análise de Mercado** - Pesquisa de preços e concorrentes
- ✅ **WhatsApp Integration** - Via Evolution API
- ✅ **Meta/Facebook Integration** - Ads e páginas
- ✅ **Notificações em Tempo Real** - Sistema de eventos
- ✅ **Webhooks** - Integração com serviços externos

## 🛠 Tecnologias

### Core
- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **React 18** - Biblioteca UI
- **Tailwind CSS** - Estilização

### Backend & Database
- **Supabase** - Autenticação e banco de dados
- **MongoDB** - Banco de dados NoSQL
- **Redis** - Cache (opcional)

### AI & Integrations
- **Google Gemini AI** - Inteligência artificial
- **Evolution API** - WhatsApp
- **Meta Graph API** - Facebook/Instagram
- **Resend** - Email (opcional)

### Charts & Visualization
- **Recharts** - Gráficos
- **VChart** - Visualizações avançadas

## 📦 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta Supabase (gratuita)
- Conta MongoDB Atlas (gratuita) ou MongoDB local
- Google API Key (Gemini AI)

### Opcionais (para funcionalidades específicas)
- Redis (para cache)
- Evolution API (para WhatsApp)
- Meta Access Token (para Facebook/Instagram)
- Resend API Key (para email marketing)

## 🚀 Instalação

1. **Clone o repositório**
```bash
git clone <seu-repositorio>
cd crm-app
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais (veja [Configuração](#-configuração))

4. **Execute o servidor de desenvolvimento**
```bash
npm run dev
```

Acesse [http://localhost:3001](http://localhost:3001)

## ⚙️ Configuração

### 1. Variáveis de Ambiente Obrigatórias

```bash
# Supabase (OBRIGATÓRIO)
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_supabase

# MongoDB (OBRIGATÓRIO)
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/crm_db

# Google Gemini AI (OBRIGATÓRIO)
GOOGLE_API_KEY=sua_chave_google_gemini

# App (OBRIGATÓRIO)
NEXT_PUBLIC_BASE_URL=http://localhost:3001
```

### 2. Variáveis Opcionais

```bash
# Redis (Opcional - para cache)
REDIS_URL=redis://localhost:6379

# Google Custom Search (Opcional - para Market Intelligence)
GOOGLE_CX=seu_custom_search_engine_id

# Evolution API (Opcional - para WhatsApp)
EVOLUTION_API_URL=sua_url_evolution_api
EVOLUTION_API_KEY=sua_chave_evolution_api

# Meta/Facebook (Opcional - para integração social)
META_ACCESS_TOKEN=seu_token_meta
FACEBOOK_ACCESS_TOKEN=seu_token_facebook

# Email (Opcional - para email marketing)
RESEND_API_KEY=sua_chave_resend
```

### 3. Configuração do Supabase

1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em Settings > API
4. Copie a URL e a chave anônima
5. Execute as migrations SQL (em `supabase/migrations/`)

### 4. Configuração do MongoDB

1. Crie uma conta em [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie um cluster gratuito
3. Configure o acesso de rede (IP whitelist)
4. Crie um usuário de banco de dados
5. Copie a connection string

### 5. Google Gemini AI

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma API Key
3. Adicione ao `.env.local`

## 📖 Uso

### Desenvolvimento

```bash
npm run dev     # Inicia servidor de desenvolvimento
npm run build   # Build para produção
npm start       # Inicia servidor de produção
npm test        # Executa testes
npm run lint    # Executa linter
```

### Acessando o Sistema

1. **Login**: `/login`
2. **Dashboard Admin**: `/admin`
3. **Caixa de Vendas**: `/cash-register`

### Criando Primeiro Usuário

1. Acesse `/login`
2. Use o formulário de autenticação do Supabase
3. Crie uma conta com email/senha

## 📁 Estrutura do Projeto

```
crm-app/
├── src/
│   ├── agents/              # 14 agentes inteligentes
│   │   ├── marketing/       # Agente de marketing
│   │   ├── bi/              # Business Intelligence
│   │   ├── security/        # Segurança
│   │   ├── cash-register/   # Sistema de caixa
│   │   └── ...
│   ├── app/                 # Next.js App Router
│   │   ├── admin/           # Dashboard administrativo
│   │   ├── api/             # API Routes
│   │   ├── auth/            # Autenticação
│   │   ├── cash-register/   # Interface de caixa
│   │   └── login/           # Página de login
│   ├── components/          # Componentes React
│   │   ├── admin/           # Componentes do admin
│   │   ├── auth/            # Componentes de auth
│   │   ├── charts/          # Gráficos
│   │   └── ui/              # Componentes base
│   ├── lib/                 # Bibliotecas e utilitários
│   │   ├── supabase.ts      # Cliente Supabase
│   │   ├── mongodb.ts       # Cliente MongoDB
│   │   ├── redis.ts         # Cliente Redis
│   │   ├── evolution.ts     # WhatsApp API
│   │   ├── metaClient.ts    # Meta/Facebook API
│   │   └── ...
│   ├── services/            # Serviços externos
│   └── types/               # Tipos TypeScript
├── public/                  # Arquivos estáticos
├── supabase/                # Migrations e schemas
├── .env.example             # Exemplo de variáveis
└── package.json             # Dependências
```

## 🤖 Agentes Inteligentes

Cada agente é uma classe especializada que usa IA (Google Gemini) para tarefas específicas:

### Marketing Agent
- Análise de campanhas
- Otimização de ROI
- Segmentação de público
- A/B testing

### BI Agent
- Análises de dados
- Relatórios automatizados
- Previsões
- KPIs

### Security Agent
- Detecção de fraudes
- Análise de riscos
- Monitoramento de segurança

### Cash Register Agent
- Gestão de caixa
- Cálculo de comissões
- Relatórios de vendas
- Notificações WhatsApp

## 🔌 APIs Disponíveis

### Campanhas
- `POST /api/campaigns/generate` - Gerar campanha com IA
- `POST /api/campaigns/validate` - Validar conformidade
- `POST /api/campaigns/predict` - Prever performance
- `POST /api/campaigns/carousel` - Criar carrossel

### Caixa
- `POST /api/cash-register/open` - Abrir caixa
- `POST /api/cash-register/entry` - Registrar venda
- `POST /api/cash-register/close` - Fechar caixa
- `GET /api/cash-register/history` - Histórico

### Market Intelligence
- `POST /api/market/search` - Pesquisar produtos
- `GET /api/market/fees` - Comparar taxas
- `GET /api/market/marketplaces` - Listar marketplaces

### Meta/Facebook
- `GET /api/meta/ads` - Campanhas de ads
- `GET /api/meta/instagram` - Dados Instagram
- `GET /api/meta/whatsapp` - WhatsApp Business

### Clientes
- `POST /api/customers/enrich` - Enriquecer dados

### Webhooks
- `POST /api/webhooks/whatsapp` - Receber mensagens
- `POST /api/webhooks/evolution` - Evolution API
- `POST /api/webhooks/checkout/abandoned` - Carrinhos abandonados

## 🐛 Troubleshooting

### Redis Connection Error
Se você ver erros de conexão Redis:
- Redis é **opcional**
- O sistema funciona sem ele (sem cache)
- Para usar: instale Redis localmente ou use serviço cloud (Upstash)

### Evolution API Not Configured
Se você ver avisos sobre Evolution API:
- WhatsApp features requerem Evolution API
- Configure `EVOLUTION_API_URL` e `EVOLUTION_API_KEY`
- Ou ignore se não usar WhatsApp

### Facebook/Meta Errors
- Verifique se o token está válido
- Tokens expiram periodicamente
- Renove em [developers.facebook.com](https://developers.facebook.com)

## 📝 Próximos Passos

1. ✅ Configurar variáveis de ambiente
2. ✅ Criar primeiro usuário
3. ✅ Explorar dashboard admin
4. ⚠️ Configurar integrações opcionais (WhatsApp, Meta)
5. ⚠️ Implementar TODOs restantes
6. ⚠️ Adicionar testes E2E
7. ⚠️ Deploy em produção (Vercel)

## 📄 Licença

Este projeto é privado e proprietário.

## 🤝 Suporte

Para dúvidas ou problemas:
1. Verifique o arquivo `ANALYSIS_REPORT.md`
2. Consulte a documentação das APIs
3. Entre em contato com o time de desenvolvimento

---

**Desenvolvido com ❤️ usando Next.js, TypeScript e IA**
