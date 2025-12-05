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
