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
