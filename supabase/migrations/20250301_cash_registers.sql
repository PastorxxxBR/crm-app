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
