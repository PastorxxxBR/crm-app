-- Fixed Cash Registers Migration
-- Removes GENERATED ALWAYS AS with SELECT subqueries (not supported in PostgreSQL)

-- Migration: Create cash_registers table
CREATE TABLE IF NOT EXISTS public.cash_registers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id uuid REFERENCES public.stores(id),
  cashier_id uuid REFERENCES public.profiles(id),
  opened_at timestamp with time zone NOT NULL,
  closed_at timestamp with time zone,
  initial_balance numeric(12,2) NOT NULL,
  final_balance numeric(12,2),
  target_amount numeric(12,2),
  commission_rate numeric(5,2),
  total_sales numeric(12,2) DEFAULT 0,
  total_commission numeric(12,2) DEFAULT 0,
  pix_received boolean DEFAULT FALSE,
  bank_account text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed'))
);

-- Enable row level security
ALTER TABLE public.cash_registers ENABLE ROW LEVEL SECURITY;

-- Policies (owner and cashier)
CREATE POLICY "owner_select_cash_registers" ON public.cash_registers
  FOR SELECT USING (true);
CREATE POLICY "cashier_select_cash_registers" ON public.cash_registers
  FOR SELECT USING (true);
CREATE POLICY "owner_insert_cash_registers" ON public.cash_registers
  FOR INSERT WITH CHECK (true);
CREATE POLICY "cashier_insert_cash_registers" ON public.cash_registers
  FOR INSERT WITH CHECK (true);
CREATE POLICY "owner_update_cash_registers" ON public.cash_registers
  FOR UPDATE USING (true);
CREATE POLICY "cashier_update_cash_registers" ON public.cash_registers
  FOR UPDATE USING (true);


-- Migration: Create cash_register_entries table
CREATE TABLE IF NOT EXISTS public.cash_register_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cash_register_id uuid REFERENCES public.cash_registers(id) ON DELETE CASCADE,
  product_id uuid,
  description text,
  quantity integer DEFAULT 1,
  unit_price numeric(12,2) NOT NULL,
  amount numeric(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at timestamp with time zone DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE public.cash_register_entries ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "public_read_cash_register_entries" ON public.cash_register_entries
  FOR SELECT USING (true);
CREATE POLICY "public_insert_cash_register_entries" ON public.cash_register_entries
  FOR INSERT WITH CHECK (true);


-- Migration: Create seller_targets table
CREATE TABLE IF NOT EXISTS public.seller_targets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id uuid REFERENCES public.profiles(id),
  target_amount numeric(12,2) NOT NULL,
  achieved_amount numeric(12,2) DEFAULT 0,
  commission_rate numeric(5,2) DEFAULT 5.0,
  period_start date NOT NULL,
  period_end date NOT NULL,
  created_at timestamp with time zone DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE public.seller_targets ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "owner_select_seller_targets" ON public.seller_targets
  FOR SELECT USING (true);
CREATE POLICY "cashier_select_seller_targets" ON public.seller_targets
  FOR SELECT USING (true);
CREATE POLICY "owner_insert_seller_targets" ON public.seller_targets
  FOR INSERT WITH CHECK (true);
CREATE POLICY "cashier_insert_seller_targets" ON public.seller_targets
  FOR INSERT WITH CHECK (true);
CREATE POLICY "owner_update_seller_targets" ON public.seller_targets
  FOR UPDATE USING (true);
CREATE POLICY "cashier_update_seller_targets" ON public.seller_targets
  FOR UPDATE USING (true);


-- Function to update total_sales and total_commission
CREATE OR REPLACE FUNCTION update_cash_register_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total_sales
  UPDATE public.cash_registers
  SET total_sales = (
    SELECT COALESCE(SUM(amount), 0)
    FROM public.cash_register_entries
    WHERE cash_register_id = NEW.cash_register_id
  ),
  total_commission = (
    SELECT COALESCE(SUM(amount), 0) * commission_rate / 100
    FROM public.cash_register_entries
    WHERE cash_register_id = NEW.cash_register_id
  )
  WHERE id = NEW.cash_register_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update totals when entries are added
CREATE TRIGGER trigger_update_cash_register_totals
AFTER INSERT OR UPDATE OR DELETE ON public.cash_register_entries
FOR EACH ROW
EXECUTE FUNCTION update_cash_register_totals();


-- Create stores table if not exists (needed for foreign key)
CREATE TABLE IF NOT EXISTS public.stores (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  address text,
  phone text,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT NOW()
);

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_stores" ON public.stores FOR SELECT USING (true);
CREATE POLICY "public_write_stores" ON public.stores FOR INSERT WITH CHECK (true);
