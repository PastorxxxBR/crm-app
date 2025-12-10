-- Inventory Agent Schema
-- Tabelas para gestão de estoque

-- Tabela de alertas de estoque
CREATE TABLE IF NOT EXISTS public.inventory_alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('low_stock', 'stockout', 'slow_mover', 'excess')),
  threshold INTEGER,
  current_quantity INTEGER NOT NULL,
  suggested_action TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_inventory_alerts_product_id ON public.inventory_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_status ON public.inventory_alerts(status);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_alert_type ON public.inventory_alerts(alert_type);

-- Tabela de sugestões de reposição
CREATE TABLE IF NOT EXISTS public.restock_suggestions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  suggested_quantity INTEGER NOT NULL,
  days_until_stockout INTEGER,
  confidence NUMERIC CHECK (confidence >= 0 AND confidence <= 1),
  reasoning TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'ordered')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_restock_suggestions_product_id ON public.restock_suggestions(product_id);
CREATE INDEX IF NOT EXISTS idx_restock_suggestions_status ON public.restock_suggestions(status);

-- Tabela de histórico de movimentações de estoque
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('purchase', 'sale', 'adjustment', 'return', 'transfer')),
  quantity INTEGER NOT NULL, -- Positive for in, negative for out
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reference_id TEXT, -- Order ID, Purchase ID, etc.
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON public.stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON public.stock_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON public.stock_movements(movement_type);

-- Adicionar colunas em products (se não existirem)
DO $$ 
BEGIN
    -- Velocity (units sold per day)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'velocity') THEN
        ALTER TABLE public.products ADD COLUMN velocity NUMERIC DEFAULT 0;
    END IF;

    -- Last restock date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'last_restock_date') THEN
        ALTER TABLE public.products ADD COLUMN last_restock_date TIMESTAMPTZ;
    END IF;

    -- Cost price
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'cost_price') THEN
        ALTER TABLE public.products ADD COLUMN cost_price NUMERIC;
    END IF;

    -- Margin
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'margin') THEN
        ALTER TABLE public.products ADD COLUMN margin NUMERIC;
    END IF;

    -- Category
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'category') THEN
        ALTER TABLE public.products ADD COLUMN category TEXT;
    END IF;

    -- Tags
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'tags') THEN
        ALTER TABLE public.products ADD COLUMN tags TEXT[];
    END IF;

    -- Images
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'images') THEN
        ALTER TABLE public.products ADD COLUMN images TEXT[];
    END IF;
END $$;

-- RLS
ALTER TABLE public.inventory_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restock_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Public Read" ON public.inventory_alerts FOR SELECT USING (true);
CREATE POLICY "Public Write" ON public.inventory_alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update" ON public.inventory_alerts FOR UPDATE USING (true);

CREATE POLICY "Public Read" ON public.restock_suggestions FOR SELECT USING (true);
CREATE POLICY "Public Write" ON public.restock_suggestions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update" ON public.restock_suggestions FOR UPDATE USING (true);

CREATE POLICY "Public Read" ON public.stock_movements FOR SELECT USING (true);
CREATE POLICY "Public Write" ON public.stock_movements FOR INSERT WITH CHECK (true);

-- Função para registrar movimentação de estoque automaticamente
CREATE OR REPLACE FUNCTION log_stock_movement()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE' AND OLD.stock_quantity != NEW.stock_quantity) THEN
        INSERT INTO public.stock_movements (
            product_id,
            movement_type,
            quantity,
            previous_quantity,
            new_quantity,
            notes
        ) VALUES (
            NEW.id,
            'adjustment',
            NEW.stock_quantity - OLD.stock_quantity,
            OLD.stock_quantity,
            NEW.stock_quantity,
            'Automatic stock adjustment'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para log automático
CREATE TRIGGER trigger_log_stock_movement
    AFTER UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION log_stock_movement();
