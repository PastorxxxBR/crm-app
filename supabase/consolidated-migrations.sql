-- Consolidated Migrations for Supabase
-- Project: urisspjzqickpatpvslg
-- Generated: 2025-12-09T22:22:35.064Z
-- Total migrations: 15



-- ========================================
-- Migration: 20250101_initial_schema.sql
-- ========================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Customers Table
create table public.customers (
  id uuid default uuid_generate_v4() primary key,
  full_name text not null,
  email text unique,
  phone text unique,
  segment text check (segment in ('varejo', 'atacado')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Orders Table
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references public.customers(id),
  total_amount decimal(10,2),
  status text default 'new',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (Example)
alter table public.customers enable row level security;

create policy "Enable read access for all users" on public.customers
  for select using (true);


-- ========================================
-- Migration: 20250115_profiles_schema.sql
-- ========================================

-- Profiles Table (Extends auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  role text default 'staff' check (role in ('admin', 'staff', 'customer')),
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone
);

-- RLS
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Function to handle new user signup
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'staff');
  return new;
end;
$$;

-- Trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ========================================
-- Migration: 20250120_campaigns_schema.sql
-- ========================================

-- Campaigns Table
create type campaign_status as enum ('draft', 'scheduled', 'processing', 'completed', 'failed');
create type campaign_channel as enum ('whatsapp', 'email', 'sms');

create table public.campaigns (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  segment jsonb not null default '{}'::jsonb, -- Filter criteria (e.g. { "tag": "atacado" })
  message_template text not null,
  channel campaign_channel not null default 'whatsapp',
  status campaign_status default 'draft',
  scheduled_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  created_by uuid references auth.users(id)
);

-- Campaign Logs (Execution History)
create table public.campaign_logs (
  id uuid default uuid_generate_v4() primary key,
  campaign_id uuid references public.campaigns(id),
  customer_id uuid references public.customers(id),
  status text check (status in ('sent', 'failed', 'delivered', 'read')),
  error_message text,
  sent_at timestamp with time zone default now()
);

-- Automation Queue (For async triggers like Abandoned Cart)
create table public.automation_queue (
  id uuid default uuid_generate_v4() primary key,
  trigger_type text not null, -- 'abandoned_cart', 'welcome_series'
  payload jsonb not null,
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  process_after timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- RLS Policies
alter table public.campaigns enable row level security;
alter table public.campaign_logs enable row level security;
alter table public.automation_queue enable row level security;

create policy "Staff can view campaigns" on campaigns for select using (true);
create policy "Staff can insert campaigns" on campaigns for insert with check (auth.uid() = created_by);
create policy "Staff can update campaigns" on campaigns for update using (true);


-- ========================================
-- Migration: 20250125_analytics_schema.sql
-- ========================================

-- view: daily_sales_snapshot
create or replace view public.daily_sales_snapshot as
select
  date_trunc('day', created_at) as day,
  sum(total_amount) as total_revenue,
  count(*) as order_count
from public.orders
group by 1
order by 1 desc
limit 30;

-- function: get_dashboard_stats
create or replace function public.get_dashboard_stats()
returns json
language plpgsql
security definer
as $$
declare
  total_revenue numeric;
  new_customers int;
  active_campaigns int;
begin
  select sum(total_amount) into total_revenue from orders where created_at >= date_trunc('month', now());
  select count(*) into new_customers from customers where created_at >= date_trunc('month', now());
  select count(*) into active_campaigns from campaigns where status in ('scheduled', 'processing');
  
  return json_build_object(
    'revenue_mtd', coalesce(total_revenue, 0),
    'new_customers', coalesce(new_customers, 0),
    'active_campaigns', coalesce(active_campaigns, 0)
  );
end;
$$;

-- Seed Data (For Testing)
insert into public.customers (full_name, email, segment) values
('Maria Silva', 'maria@example.com', 'varejo'),
('Loja Fashion Sul', 'contato@fashionsul.com', 'atacado');

insert into public.orders (customer_id, total_amount, created_at)
select 
  id, 
  (random() * 500 + 100)::numeric(10,2),
  now() - (random() * interval '30 days')
from public.customers
limit 50;


-- ========================================
-- Migration: 20250126_bi_schema.sql
-- ========================================

-- BI Reports Table
create table if not exists public.bi_reports (
  id uuid default uuid_generate_v4() primary key,
  report_data jsonb,
  input_metrics jsonb,
  created_at timestamp with time zone default now()
);

alter table public.bi_reports enable row level security;
create policy "Enable read access for all" on "public"."bi_reports" for select using (true);
create policy "Enable insert for all" on "public"."bi_reports" for insert with check (true);


-- ========================================
-- Migration: 20250126_expansion_agents.sql
-- ========================================

-- Social Media Reports
create table if not exists public.social_media_reports (
  id uuid default uuid_generate_v4() primary key,
  platform text, -- 'instagram', 'tiktok', etc.
  segmentation_data jsonb, -- { "age": "18-24", "interests": [...] }
  post_analysis jsonb, -- { "top_posts": [...], "engagement_rate": 0.05 }
  suggestions jsonb, -- { "best_time": "18:00", "format": "reels" }
  created_at timestamp with time zone default now()
);

-- Competitive Reports
create table if not exists public.competitive_reports (
  id uuid default uuid_generate_v4() primary key,
  competitor_name text,
  product_comparison jsonb, -- { "our_product": "A", "their_product": "B", "price_diff": -10 }
  strategies_detected jsonb, -- { "promo": true, "influencer": false }
  created_at timestamp with time zone default now()
);

-- Trending Products
create table if not exists public.trending_products (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id), -- Optional if we just use string names
  product_name text,
  ranking integer,
  trend_score numeric, -- 0-100
  prediction jsonb, -- { "next_month_sales": 500 }
  created_at timestamp with time zone default now()
);

-- Content Strategies
create table if not exists public.content_strategies (
  id uuid default uuid_generate_v4() primary key,
  theme text,
  media_type text, -- 'video', 'image'
  creative_suggestion text,
  competitor_examples jsonb, -- Link to competitor posts
  created_at timestamp with time zone default now()
);

-- Consolidated CRM Reports (Cron Job Output)
create table if not exists public.crm_reports (
  id uuid default uuid_generate_v4() primary key,
  report_type text default '3_day_summary',
  summary_json jsonb, -- Full aggregated data
  executive_summary text, -- Agent written summary
  created_at timestamp with time zone default now()
);

-- RLS
alter table public.social_media_reports enable row level security;
alter table public.competitive_reports enable row level security;
alter table public.trending_products enable row level security;
alter table public.content_strategies enable row level security;
alter table public.crm_reports enable row level security;

create policy "Read All" on "public"."social_media_reports" for select using (true);
create policy "Insert All" on "public"."social_media_reports" for insert with check (true);

create policy "Read All" on "public"."competitive_reports" for select using (true);
create policy "Insert All" on "public"."competitive_reports" for insert with check (true);

create policy "Read All" on "public"."trending_products" for select using (true);
create policy "Insert All" on "public"."trending_products" for insert with check (true);

create policy "Read All" on "public"."content_strategies" for select using (true);
create policy "Insert All" on "public"."content_strategies" for insert with check (true);

create policy "Read All" on "public"."crm_reports" for select using (true);
create policy "Insert All" on "public"."crm_reports" for insert with check (true);


-- ========================================
-- Migration: 20250126_marketing_intelligence_schema.sql
-- ========================================

-- Add metrics column to campaigns for caching aggregate stats
alter table public.campaigns 
add column if not exists metrics jsonb default '{"sent": 0, "delivered": 0, "read": 0, "clicks": 0, "conversions": 0}'::jsonb;

-- Create Marketing Recommendations Table
create table if not exists public.marketing_recommendations (
  id uuid default uuid_generate_v4() primary key,
  campaign_id uuid references public.campaigns(id),
  type text not null, -- 'optimization', 'content', 'timing'
  suggestion text not null,
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  status text default 'pending' check (status in ('pending', 'applied', 'dismissed')),
  created_at timestamp with time zone default now(),
  created_by uuid references auth.users(id) -- Automated agents might insert sending NULL or system user ID
);

-- RLS
alter table public.marketing_recommendations enable row level security;

create policy "Staff can view recommendations" on marketing_recommendations for select using (true);
create policy "Staff/System can insert recommendations" on marketing_recommendations for insert with check (true);
create policy "Staff/System can update recommendations" on marketing_recommendations for update using (true);


-- ========================================
-- Migration: 20250126_master_fix.sql
-- ========================================

-- MASTER FIX: Ensure ALL Agent Tables exist
-- Run this in Supabase SQL Editor

-- 1. Core Products (Reference for many agents)
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  sku text not null unique,
  name text not null,
  price numeric not null,
  stock_quantity integer default 0,
  created_at timestamp with time zone default now()
);

-- 2. Marketing Agent
create table if not exists public.marketing_recommendations (
  id uuid default uuid_generate_v4() primary key,
  campaign_id text,
  type text,
  suggestion text,
  priority text,
  status text default 'pending',
  created_at timestamp with time zone default now()
);

-- 3. Marketplaces Agent
create table if not exists public.marketplace_suggestions (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id), -- Nullable if product not linked yet
  suggested_price numeric,
  strategy text,
  reason text,
  created_at timestamp with time zone default now()
);

-- 4. Security Agent
create table if not exists public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  actor text,
  action text,
  resource text,
  risk_level text,
  reason text,
  suspicious boolean,
  created_at timestamp with time zone default now()
);

-- 5. BI Agent
create table if not exists public.bi_reports (
  id uuid default uuid_generate_v4() primary key,
  report_data jsonb,
  input_metrics jsonb,
  insight text,
  revenue_prediction numeric,
  churn_risk text,
  created_at timestamp with time zone default now()
);

-- 6. Social Media Agent (Expansion)
create table if not exists public.social_media_reports (
  id uuid default uuid_generate_v4() primary key,
  platform text,
  segmentation_data jsonb,
  post_analysis jsonb,
  suggestions jsonb,
  created_at timestamp with time zone default now()
);

-- 7. Competitive Agent (Expansion)
create table if not exists public.competitive_reports (
  id uuid default uuid_generate_v4() primary key,
  competitor_name text,
  product_comparison jsonb,
  strategies_detected jsonb,
  created_at timestamp with time zone default now()
);

-- 8. Trending Agent (Expansion)
create table if not exists public.trending_products (
  id uuid default uuid_generate_v4() primary key,
  product_name text,
  ranking integer,
  trend_score numeric,
  prediction jsonb,
  created_at timestamp with time zone default now()
);

-- 9. Content Strategy Agent (Expansion)
create table if not exists public.content_strategies (
  id uuid default uuid_generate_v4() primary key,
  theme text,
  media_type text,
  creative_suggestion text,
  competitor_examples jsonb,
  created_at timestamp with time zone default now()
);

-- 10. Reporting Engine (Consolidated)
create table if not exists public.crm_reports (
  id uuid default uuid_generate_v4() primary key,
  report_type text default '3_day_summary',
  summary_json jsonb,
  executive_summary text,
  created_at timestamp with time zone default now()
);

-- GLOBAL RLS (Enable Security)
alter table public.products enable row level security;
alter table public.marketing_recommendations enable row level security;
alter table public.marketplace_suggestions enable row level security;
alter table public.audit_logs enable row level security;
alter table public.bi_reports enable row level security;
alter table public.social_media_reports enable row level security;
alter table public.competitive_reports enable row level security;
alter table public.trending_products enable row level security;
alter table public.content_strategies enable row level security;
alter table public.crm_reports enable row level security;

-- OPEN POLICIES (For Dev/Demo ease - tighten in prod if needed)
create policy "Public Read" on "public"."products" for select using (true);
create policy "Public Write" on "public"."products" for insert with check (true);

create policy "Public Read" on "public"."marketing_recommendations" for select using (true);
create policy "Public Write" on "public"."marketing_recommendations" for insert with check (true);

create policy "Public Read" on "public"."marketplace_suggestions" for select using (true);
create policy "Public Write" on "public"."marketplace_suggestions" for insert with check (true);

create policy "Public Read" on "public"."audit_logs" for select using (true);
create policy "Public Write" on "public"."audit_logs" for insert with check (true);

create policy "Public Read" on "public"."bi_reports" for select using (true);
create policy "Public Write" on "public"."bi_reports" for insert with check (true);

create policy "Public Read" on "public"."social_media_reports" for select using (true);
create policy "Public Write" on "public"."social_media_reports" for insert with check (true);

create policy "Public Read" on "public"."competitive_reports" for select using (true);
create policy "Public Write" on "public"."competitive_reports" for insert with check (true);

create policy "Public Read" on "public"."trending_products" for select using (true);
create policy "Public Write" on "public"."trending_products" for insert with check (true);

create policy "Public Read" on "public"."content_strategies" for select using (true);
create policy "Public Write" on "public"."content_strategies" for insert with check (true);

create policy "Public Read" on "public"."crm_reports" for select using (true);
create policy "Public Write" on "public"."crm_reports" for insert with check (true);


-- ========================================
-- Migration: 20250126_misc_agent_schema.sql
-- ========================================

-- Products Table (if not exists)
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  sku text not null unique,
  name text not null,
  price numeric not null,
  stock_quantity integer default 0,
  marketplace_sync_status jsonb default '{}'::jsonb, -- { "shopee": "synced", "ml": "pending" }
  created_at timestamp with time zone default now()
);

-- Marketplace Suggestions (generated by Agent)
create table if not exists public.marketplace_suggestions (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id),
  suggested_price numeric,
  strategy text,
  reason text,
  created_at timestamp with time zone default now()
);

-- Security Logs (Audit)
create table if not exists public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  actor text,
  action text,
  resource text,
  risk_level text,
  created_at timestamp with time zone default now()
);

-- RLS
alter table public.products enable row level security;
alter table public.marketplace_suggestions enable row level security;
alter table public.audit_logs enable row level security;

create policy "Enable read access for all users" on "public"."products" for select using (true);
create policy "Enable insert for authenticated users only" on "public"."products" for insert with check (auth.role() = 'authenticated');


-- ========================================
-- Migration: 20250209_customer_service_schema.sql
-- ========================================

-- Customer Service Agent Schema
-- Tabela de tickets de atendimento

CREATE TABLE IF NOT EXISTS public.customer_tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_phone TEXT NOT NULL,
  customer_id UUID REFERENCES public.profiles(id),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  category TEXT,
  ai_response TEXT,
  escalated BOOLEAN DEFAULT false,
  assigned_to UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_customer_tickets_status ON public.customer_tickets(status);
CREATE INDEX IF NOT EXISTS idx_customer_tickets_priority ON public.customer_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_customer_tickets_customer_phone ON public.customer_tickets(customer_phone);
CREATE INDEX IF NOT EXISTS idx_customer_tickets_created_at ON public.customer_tickets(created_at DESC);

-- Tabela de interações (histórico de mensagens)
CREATE TABLE IF NOT EXISTS public.customer_interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id UUID REFERENCES public.customer_tickets(id) ON DELETE CASCADE,
  customer_phone TEXT NOT NULL,
  message TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  channel TEXT DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'email', 'phone', 'chat')),
  sent_by TEXT, -- 'customer', 'agent', 'ai'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_interactions_ticket_id ON public.customer_interactions(ticket_id);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_created_at ON public.customer_interactions(created_at DESC);

-- Tabela de FAQ (Perguntas Frequentes)
CREATE TABLE IF NOT EXISTS public.faq_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  keywords TEXT[], -- Array de palavras-chave para matching
  category TEXT,
  active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faq_entries_active ON public.faq_entries(active);
CREATE INDEX IF NOT EXISTS idx_faq_entries_keywords ON public.faq_entries USING GIN(keywords);

-- RLS (Row Level Security)
ALTER TABLE public.customer_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_entries ENABLE ROW LEVEL SECURITY;

-- Políticas (Public para desenvolvimento - ajustar em produção)
CREATE POLICY "Public Read" ON public.customer_tickets FOR SELECT USING (true);
CREATE POLICY "Public Write" ON public.customer_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update" ON public.customer_tickets FOR UPDATE USING (true);

CREATE POLICY "Public Read" ON public.customer_interactions FOR SELECT USING (true);
CREATE POLICY "Public Write" ON public.customer_interactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read" ON public.faq_entries FOR SELECT USING (true);
CREATE POLICY "Public Write" ON public.faq_entries FOR INSERT WITH CHECK (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para customer_tickets
CREATE TRIGGER update_customer_tickets_updated_at
    BEFORE UPDATE ON public.customer_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para faq_entries
CREATE TRIGGER update_faq_entries_updated_at
    BEFORE UPDATE ON public.faq_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir FAQs iniciais
INSERT INTO public.faq_entries (question, answer, keywords, category) VALUES
(
  'Qual o horário de atendimento?',
  '🕐 Nosso horário de atendimento é de Segunda a Sexta, das 9h às 18h. Sábados das 9h às 13h.',
  ARRAY['horário', 'horario', 'funciona', 'aberto', 'atendimento'],
  'geral'
),
(
  'Qual o prazo de entrega?',
  '📦 O prazo de entrega é de 3 a 7 dias úteis para todo o Brasil. Você receberá o código de rastreamento por email.',
  ARRAY['prazo', 'entrega', 'demora', 'quanto tempo', 'dias'],
  'entrega'
),
(
  'Como funciona a troca?',
  '🔄 Aceitamos trocas em até 7 dias após o recebimento. O produto deve estar sem uso, com etiqueta. Entre em contato para solicitar.',
  ARRAY['troca', 'devolução', 'devolver', 'trocar'],
  'troca'
),
(
  'Quais as formas de pagamento?',
  '💳 Aceitamos: Cartão de crédito, PIX, Boleto e Mercado Pago. Parcelamos em até 3x sem juros.',
  ARRAY['pagamento', 'pagar', 'formas', 'cartão', 'pix', 'boleto'],
  'pagamento'
),
(
  'Como funciona o atacado?',
  '📊 ATACADO: Compras acima de 12 peças têm 25% de desconto! De 6 a 11 peças: 15% off. Consulte nosso catálogo atacado.',
  ARRAY['atacado', 'wholesale', 'grade fechada', 'quantidade', 'desconto volume'],
  'atacado'
),
(
  'Como rastrear meu pedido?',
  '🔍 Para rastrear seu pedido, acesse: https://rastreamento.correios.com.br e insira o código que enviamos por email.',
  ARRAY['rastreamento', 'rastrear', 'código', 'onde está', 'pedido'],
  'pedido'
);


-- ========================================
-- Migration: 20250209_email_loyalty_schema.sql
-- ========================================

-- Email Marketing & Loyalty Agents Schema

-- ============================================
-- EMAIL MARKETING TABLES
-- ============================================

-- Email campaigns table
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  segment TEXT DEFAULT 'all' CHECK (segment IN ('all', 'new_customers', 'vip', 'inactive', 'abandoned_cart')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent')),
  sent_count INTEGER DEFAULT 0,
  open_rate NUMERIC,
  click_rate NUMERIC,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON public.email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_segment ON public.email_campaigns(segment);

-- ============================================
-- LOYALTY PROGRAM TABLES
-- ============================================

-- Loyalty points table
CREATE TABLE IF NOT EXISTS public.loyalty_points (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  points INTEGER DEFAULT 0 CHECK (points >= 0),
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  lifetime_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_points_customer_id ON public.loyalty_points(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_tier ON public.loyalty_points(tier);

-- Loyalty rewards catalog
CREATE TABLE IF NOT EXISTS public.loyalty_rewards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL CHECK (points_required > 0),
  type TEXT NOT NULL CHECK (type IN ('discount', 'free_shipping', 'free_product', 'exclusive_access')),
  value NUMERIC NOT NULL, -- Discount % or product value
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_active ON public.loyalty_rewards(active);
CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_points ON public.loyalty_rewards(points_required);

-- Loyalty transactions log
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id TEXT,
  points_earned INTEGER DEFAULT 0,
  points_spent INTEGER DEFAULT 0,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer_id ON public.loyalty_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_created_at ON public.loyalty_transactions(created_at DESC);

-- ============================================
-- PROFILES TABLE UPDATES
-- ============================================

-- Add loyalty-related columns to profiles
DO $$ 
BEGIN
    -- Total spent
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'total_spent') THEN
        ALTER TABLE public.profiles ADD COLUMN total_spent NUMERIC DEFAULT 0;
    END IF;

    -- Last purchase date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'last_purchase_date') THEN
        ALTER TABLE public.profiles ADD COLUMN last_purchase_date TIMESTAMPTZ;
    END IF;

    -- Phone
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE public.profiles ADD COLUMN phone TEXT;
    END IF;

    -- Avatar URL
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    END IF;

    -- Customer tier (denormalized for quick access)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'customer_tier') THEN
        ALTER TABLE public.profiles ADD COLUMN customer_tier TEXT DEFAULT 'bronze';
    END IF;

    -- Tags
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'tags') THEN
        ALTER TABLE public.profiles ADD COLUMN tags TEXT[];
    END IF;

    -- Name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'name') THEN
        ALTER TABLE public.profiles ADD COLUMN name TEXT;
    END IF;

    -- Email (if not exists)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT UNIQUE;
    END IF;
END $$;

-- ============================================
-- RLS (Row Level Security)
-- ============================================

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- Policies (Public for development)
CREATE POLICY "Public Read" ON public.email_campaigns FOR SELECT USING (true);
CREATE POLICY "Public Write" ON public.email_campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update" ON public.email_campaigns FOR UPDATE USING (true);

CREATE POLICY "Public Read" ON public.loyalty_points FOR SELECT USING (true);
CREATE POLICY "Public Write" ON public.loyalty_points FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update" ON public.loyalty_points FOR UPDATE USING (true);

CREATE POLICY "Public Read" ON public.loyalty_rewards FOR SELECT USING (true);
CREATE POLICY "Public Write" ON public.loyalty_rewards FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read" ON public.loyalty_transactions FOR SELECT USING (true);
CREATE POLICY "Public Write" ON public.loyalty_transactions FOR INSERT WITH CHECK (true);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at on email_campaigns
CREATE TRIGGER update_email_campaigns_updated_at
    BEFORE UPDATE ON public.email_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at on loyalty_points
CREATE TRIGGER update_loyalty_points_updated_at
    BEFORE UPDATE ON public.loyalty_points
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA - Loyalty Rewards
-- ============================================

INSERT INTO public.loyalty_rewards (name, description, points_required, type, value, active) VALUES
('5% de Desconto', 'Cupom de 5% OFF em qualquer compra', 100, 'discount', 5, true),
('10% de Desconto', 'Cupom de 10% OFF em qualquer compra', 250, 'discount', 10, true),
('15% de Desconto', 'Cupom de 15% OFF em qualquer compra', 500, 'discount', 15, true),
('20% de Desconto', 'Cupom de 20% OFF em qualquer compra', 1000, 'discount', 20, true),
('Frete Grátis', 'Frete grátis em qualquer pedido', 200, 'free_shipping', 0, true),
('Produto Grátis', 'Escolha um produto de até R$ 50', 800, 'free_product', 50, true),
('Acesso VIP', 'Acesso antecipado a lançamentos', 1500, 'exclusive_access', 0, true),
('Super Desconto 30%', 'Cupom de 30% OFF - Exclusivo Platinum', 2500, 'discount', 30, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- View: Customer loyalty summary
CREATE OR REPLACE VIEW public.customer_loyalty_summary AS
SELECT 
    p.id as customer_id,
    p.email,
    p.name,
    COALESCE(lp.points, 0) as current_points,
    COALESCE(lp.tier, 'bronze') as tier,
    COALESCE(lp.lifetime_points, 0) as lifetime_points,
    p.total_spent,
    p.last_purchase_date,
    CASE 
        WHEN p.last_purchase_date IS NULL THEN 'never_purchased'
        WHEN p.last_purchase_date < NOW() - INTERVAL '90 days' THEN 'high_churn_risk'
        WHEN p.last_purchase_date < NOW() - INTERVAL '60 days' THEN 'medium_churn_risk'
        WHEN p.last_purchase_date < NOW() - INTERVAL '30 days' THEN 'low_churn_risk'
        ELSE 'active'
    END as churn_risk
FROM public.profiles p
LEFT JOIN public.loyalty_points lp ON p.id = lp.customer_id;

-- View: Email campaign performance
CREATE OR REPLACE VIEW public.email_campaign_performance AS
SELECT 
    id,
    name,
    subject,
    segment,
    status,
    sent_count,
    COALESCE(open_rate, 0) as open_rate,
    COALESCE(click_rate, 0) as click_rate,
    sent_at,
    created_at
FROM public.email_campaigns
WHERE status = 'sent'
ORDER BY sent_at DESC;


-- ========================================
-- Migration: 20250209_inventory_schema.sql
-- ========================================

-- Inventory Agent Schema
-- Tabelas para gestão de estoque

-- Tabela de alertas de estoque
CREATE TABLE IF NOT EXISTS public.inventory_alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('low_stock', 'stockout', 'slow_mover', 'excess')),
  threshold INTEGER,
  current_quantity INTEGER NOT NULL,
  suggested_action TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_inventory_alerts_product_id ON public.inventory_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_status ON public.inventory_alerts(status);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_alert_type ON public.inventory_alerts(alert_type);

-- Tabela de sugestões de reposição
CREATE TABLE IF NOT EXISTS public.restock_suggestions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  suggested_quantity INTEGER NOT NULL,
  days_until_stockout INTEGER,
  confidence NUMERIC CHECK (confidence >= 0 AND confidence <= 1),
  reasoning TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'ordered')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_restock_suggestions_product_id ON public.restock_suggestions(product_id);
CREATE INDEX IF NOT EXISTS idx_restock_suggestions_status ON public.restock_suggestions(status);

-- Tabela de histórico de movimentações de estoque
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('purchase', 'sale', 'adjustment', 'return', 'transfer')),
  quantity INTEGER NOT NULL, -- Positive for in, negative for out
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reference_id TEXT, -- Order ID, Purchase ID, etc.
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON public.stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON public.stock_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON public.stock_movements(movement_type);

-- Adicionar colunas em products (se não existirem)
DO $$ 
BEGIN
    -- Velocity (units sold per day)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'velocity') THEN
        ALTER TABLE public.products ADD COLUMN velocity NUMERIC DEFAULT 0;
    END IF;

    -- Last restock date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'last_restock_date') THEN
        ALTER TABLE public.products ADD COLUMN last_restock_date TIMESTAMPTZ;
    END IF;

    -- Cost price
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'cost_price') THEN
        ALTER TABLE public.products ADD COLUMN cost_price NUMERIC;
    END IF;

    -- Margin
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'margin') THEN
        ALTER TABLE public.products ADD COLUMN margin NUMERIC;
    END IF;

    -- Category
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'category') THEN
        ALTER TABLE public.products ADD COLUMN category TEXT;
    END IF;

    -- Tags
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'tags') THEN
        ALTER TABLE public.products ADD COLUMN tags TEXT[];
    END IF;

    -- Images
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'images') THEN
        ALTER TABLE public.products ADD COLUMN images TEXT[];
    END IF;
END $$;

-- RLS
ALTER TABLE public.inventory_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restock_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Public Read" ON public.inventory_alerts FOR SELECT USING (true);
CREATE POLICY "Public Write" ON public.inventory_alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update" ON public.inventory_alerts FOR UPDATE USING (true);

CREATE POLICY "Public Read" ON public.restock_suggestions FOR SELECT USING (true);
CREATE POLICY "Public Write" ON public.restock_suggestions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update" ON public.restock_suggestions FOR UPDATE USING (true);

CREATE POLICY "Public Read" ON public.stock_movements FOR SELECT USING (true);
CREATE POLICY "Public Write" ON public.stock_movements FOR INSERT WITH CHECK (true);

-- Função para registrar movimentação de estoque automaticamente
CREATE OR REPLACE FUNCTION log_stock_movement()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE' AND OLD.stock_quantity != NEW.stock_quantity) THEN
        INSERT INTO public.stock_movements (
            product_id,
            movement_type,
            quantity,
            previous_quantity,
            new_quantity,
            notes
        ) VALUES (
            NEW.id,
            'adjustment',
            NEW.stock_quantity - OLD.stock_quantity,
            OLD.stock_quantity,
            NEW.stock_quantity,
            'Automatic stock adjustment'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para log automático
CREATE TRIGGER trigger_log_stock_movement
    AFTER UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION log_stock_movement();


-- ========================================
-- Migration: 20250301_cash_registers.sql
-- ========================================

-- Migration: Create cash_registers table
CREATE TABLE public.cash_registers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id uuid REFERENCES public.stores(id) NOT NULL,
  cashier_id uuid REFERENCES public.profiles(id) NOT NULL,
  opened_at timestamp with time zone NOT NULL,
  closed_at timestamp with time zone,
  initial_balance numeric(12,2) NOT NULL,
  final_balance numeric(12,2),
  target_amount numeric(12,2),
  commission_rate numeric(5,2),
  total_commission numeric(12,2) GENERATED ALWAYS AS (total_sales * commission_rate / 100) STORED,
  pix_received boolean DEFAULT FALSE,
  bank_account text,
  total_sales numeric(12,2) GENERATED ALWAYS AS (
    SELECT COALESCE(SUM(amount),0) FROM public.cash_register_entries WHERE cash_register_id = id
  ) STORED
);

-- Enable row level security
ALTER TABLE public.cash_registers ENABLE ROW LEVEL SECURITY;

-- Policies (owner and cashier)
CREATE POLICY "owner_select" ON public.cash_registers
  FOR SELECT USING (auth.role() = 'owner');
CREATE POLICY "cashier_select" ON public.cash_registers
  FOR SELECT USING (auth.uid() = cashier_id);
CREATE POLICY "owner_insert" ON public.cash_registers
  FOR INSERT WITH CHECK (auth.role() = 'owner');
CREATE POLICY "cashier_insert" ON public.cash_registers
  FOR INSERT WITH CHECK (auth.uid() = cashier_id);
CREATE POLICY "owner_update" ON public.cash_registers
  FOR UPDATE USING (auth.role() = 'owner');
CREATE POLICY "cashier_update" ON public.cash_registers
  FOR UPDATE USING (auth.uid() = cashier_id);


-- ========================================
-- Migration: 20250302_cash_register_entries.sql
-- ========================================

-- Migration: Create cash_register_entries table
CREATE TABLE public.cash_register_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cash_register_id uuid REFERENCES public.cash_registers(id) NOT NULL,
  product_id uuid REFERENCES public.products(id),
  description text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(12,2) NOT NULL,
  amount numeric(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable row level security
ALTER TABLE public.cash_register_entries ENABLE ROW LEVEL SECURITY;

-- Policies (owner and cashier)
CREATE POLICY "owner_select" ON public.cash_register_entries
  FOR SELECT USING (auth.role() = 'owner');
CREATE POLICY "cashier_select" ON public.cash_register_entries
  FOR SELECT USING (auth.uid() = (SELECT cashier_id FROM public.cash_registers WHERE id = cash_register_id));
CREATE POLICY "owner_insert" ON public.cash_register_entries
  FOR INSERT WITH CHECK (auth.role() = 'owner');
CREATE POLICY "cashier_insert" ON public.cash_register_entries
  FOR INSERT WITH CHECK (auth.uid() = (SELECT cashier_id FROM public.cash_registers WHERE id = cash_register_id));
CREATE POLICY "owner_update" ON public.cash_register_entries
  FOR UPDATE USING (auth.role() = 'owner');
CREATE POLICY "cashier_update" ON public.cash_register_entries
  FOR UPDATE USING (auth.uid() = (SELECT cashier_id FROM public.cash_registers WHERE id = cash_register_id));


-- ========================================
-- Migration: 20250303_seller_targets.sql
-- ========================================

-- Migration: Create seller_targets table
CREATE TABLE public.seller_targets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id uuid REFERENCES public.profiles(id) NOT NULL,
  store_id uuid REFERENCES public.stores(id) NOT NULL,
  period text NOT NULL, -- e.g., 'weekly', 'monthly'
  goal_amount numeric(12,2) NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable row level security
ALTER TABLE public.seller_targets ENABLE ROW LEVEL SECURITY;

-- Policies (owner and cashier)
CREATE POLICY "owner_select" ON public.seller_targets
  FOR SELECT USING (auth.role() = 'owner');
CREATE POLICY "cashier_select" ON public.seller_targets
  FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "owner_insert" ON public.seller_targets
  FOR INSERT WITH CHECK (auth.role() = 'owner');
CREATE POLICY "cashier_insert" ON public.seller_targets
  FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "owner_update" ON public.seller_targets
  FOR UPDATE USING (auth.role() = 'owner');
CREATE POLICY "cashier_update" ON public.seller_targets
  FOR UPDATE USING (auth.uid() = seller_id);
