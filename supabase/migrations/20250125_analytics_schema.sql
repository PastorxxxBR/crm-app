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
