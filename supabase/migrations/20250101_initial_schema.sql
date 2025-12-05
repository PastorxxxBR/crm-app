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
