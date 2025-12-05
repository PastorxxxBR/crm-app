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
