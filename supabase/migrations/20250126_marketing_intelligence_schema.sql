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
