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
