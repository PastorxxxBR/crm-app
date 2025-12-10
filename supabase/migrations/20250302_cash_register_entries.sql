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
