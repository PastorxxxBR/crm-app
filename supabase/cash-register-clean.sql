-- ============================================
-- CASH REGISTER - SQL CORRIGIDO (SEM ERROS)
-- ============================================
-- Execute este arquivo no SQL Editor do Supabase
-- https://supabase.com/dashboard/project/urisspjzqickpatpvslg/sql

-- 0. Criar tabela de perfis (profiles) - NECESSÁRIA para foreign keys
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'cashier', 'customer')),
  full_name text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW()
);

-- 1. Criar tabela de lojas (stores)
CREATE TABLE IF NOT EXISTS public.stores (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  address text,
  phone text,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT NOW()
);

-- 2. Criar tabela de caixas (cash_registers)
CREATE TABLE IF NOT EXISTS public.cash_registers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id uuid REFERENCES public.stores(id),
  cashier_id uuid REFERENCES public.profiles(id),
  opened_at timestamp with time zone NOT NULL,
  closed_at timestamp with time zone,
  initial_balance numeric(12,2) NOT NULL DEFAULT 0,
  final_balance numeric(12,2),
  target_amount numeric(12,2),
  commission_rate numeric(5,2) DEFAULT 5.0,
  total_sales numeric(12,2) DEFAULT 0,
  total_commission numeric(12,2) DEFAULT 0,
  pix_received boolean DEFAULT FALSE,
  bank_account text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at timestamp with time zone DEFAULT NOW()
);

-- 3. Criar tabela de entradas/vendas (cash_register_entries)
CREATE TABLE IF NOT EXISTS public.cash_register_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cash_register_id uuid REFERENCES public.cash_registers(id) ON DELETE CASCADE,
  product_id uuid,
  description text,
  quantity integer DEFAULT 1,
  unit_price numeric(12,2) NOT NULL,
  amount numeric(12,2),
  created_at timestamp with time zone DEFAULT NOW()
);

-- 4. Criar tabela de metas dos vendedores (seller_targets)
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

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Função para calcular o amount automaticamente
CREATE OR REPLACE FUNCTION calculate_entry_amount()
RETURNS TRIGGER AS $$
BEGIN
  NEW.amount := NEW.quantity * NEW.unit_price;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular amount
CREATE TRIGGER trigger_calculate_entry_amount
BEFORE INSERT OR UPDATE ON public.cash_register_entries
FOR EACH ROW
EXECUTE FUNCTION calculate_entry_amount();

-- Função para atualizar totais do caixa
CREATE OR REPLACE FUNCTION update_cash_register_totals()
RETURNS TRIGGER AS $$
DECLARE
  register_id uuid;
  commission numeric;
BEGIN
  -- Determinar qual registro atualizar
  IF TG_OP = 'DELETE' THEN
    register_id := OLD.cash_register_id;
  ELSE
    register_id := NEW.cash_register_id;
  END IF;

  -- Atualizar total_sales
  UPDATE public.cash_registers
  SET 
    total_sales = (
      SELECT COALESCE(SUM(amount), 0)
      FROM public.cash_register_entries
      WHERE cash_register_id = register_id
    )
  WHERE id = register_id;

  -- Atualizar total_commission baseado no total_sales
  UPDATE public.cash_registers
  SET total_commission = (total_sales * commission_rate / 100)
  WHERE id = register_id;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar totais
CREATE TRIGGER trigger_update_cash_register_totals
AFTER INSERT OR UPDATE OR DELETE ON public.cash_register_entries
FOR EACH ROW
EXECUTE FUNCTION update_cash_register_totals();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_register_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_targets ENABLE ROW LEVEL SECURITY;

-- Políticas abertas para desenvolvimento (ajustar em produção)
CREATE POLICY "public_all_profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_stores" ON public.stores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_cash_registers" ON public.cash_registers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_entries" ON public.cash_register_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_targets" ON public.seller_targets FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- DADOS DE TESTE (OPCIONAL)
-- ============================================

-- Inserir loja principal - São Sebastião
INSERT INTO public.stores (name, address, phone) VALUES
('Loja São Sebastião Centro', 'Rua Capitão Luiz Soares, 386 - Centro, São Sebastião - SP, CEP 11608-608', '(12) 3892-XXXX')
ON CONFLICT DO NOTHING;

-- Sucesso! Tabelas criadas.

