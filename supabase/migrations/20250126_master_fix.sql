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
