-- Email Marketing & Loyalty Agents Schema

-- ============================================
-- EMAIL MARKETING TABLES
-- ============================================

-- Email campaigns table
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  segment TEXT DEFAULT 'all' CHECK (segment IN ('all', 'new_customers', 'vip', 'inactive', 'abandoned_cart')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent')),
  sent_count INTEGER DEFAULT 0,
  open_rate NUMERIC,
  click_rate NUMERIC,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON public.email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_segment ON public.email_campaigns(segment);

-- ============================================
-- LOYALTY PROGRAM TABLES
-- ============================================

-- Loyalty points table
CREATE TABLE IF NOT EXISTS public.loyalty_points (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  points INTEGER DEFAULT 0 CHECK (points >= 0),
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  lifetime_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_points_customer_id ON public.loyalty_points(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_tier ON public.loyalty_points(tier);

-- Loyalty rewards catalog
CREATE TABLE IF NOT EXISTS public.loyalty_rewards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL CHECK (points_required > 0),
  type TEXT NOT NULL CHECK (type IN ('discount', 'free_shipping', 'free_product', 'exclusive_access')),
  value NUMERIC NOT NULL, -- Discount % or product value
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_active ON public.loyalty_rewards(active);
CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_points ON public.loyalty_rewards(points_required);

-- Loyalty transactions log
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id TEXT,
  points_earned INTEGER DEFAULT 0,
  points_spent INTEGER DEFAULT 0,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer_id ON public.loyalty_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_created_at ON public.loyalty_transactions(created_at DESC);

-- ============================================
-- PROFILES TABLE UPDATES
-- ============================================

-- Add loyalty-related columns to profiles
DO $$ 
BEGIN
    -- Total spent
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'total_spent') THEN
        ALTER TABLE public.profiles ADD COLUMN total_spent NUMERIC DEFAULT 0;
    END IF;

    -- Last purchase date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'last_purchase_date') THEN
        ALTER TABLE public.profiles ADD COLUMN last_purchase_date TIMESTAMPTZ;
    END IF;

    -- Phone
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE public.profiles ADD COLUMN phone TEXT;
    END IF;

    -- Avatar URL
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    END IF;

    -- Customer tier (denormalized for quick access)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'customer_tier') THEN
        ALTER TABLE public.profiles ADD COLUMN customer_tier TEXT DEFAULT 'bronze';
    END IF;

    -- Tags
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'tags') THEN
        ALTER TABLE public.profiles ADD COLUMN tags TEXT[];
    END IF;

    -- Name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'name') THEN
        ALTER TABLE public.profiles ADD COLUMN name TEXT;
    END IF;

    -- Email (if not exists)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT UNIQUE;
    END IF;
END $$;

-- ============================================
-- RLS (Row Level Security)
-- ============================================

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- Policies (Public for development)
CREATE POLICY "Public Read" ON public.email_campaigns FOR SELECT USING (true);
CREATE POLICY "Public Write" ON public.email_campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update" ON public.email_campaigns FOR UPDATE USING (true);

CREATE POLICY "Public Read" ON public.loyalty_points FOR SELECT USING (true);
CREATE POLICY "Public Write" ON public.loyalty_points FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update" ON public.loyalty_points FOR UPDATE USING (true);

CREATE POLICY "Public Read" ON public.loyalty_rewards FOR SELECT USING (true);
CREATE POLICY "Public Write" ON public.loyalty_rewards FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read" ON public.loyalty_transactions FOR SELECT USING (true);
CREATE POLICY "Public Write" ON public.loyalty_transactions FOR INSERT WITH CHECK (true);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at on email_campaigns
CREATE TRIGGER update_email_campaigns_updated_at
    BEFORE UPDATE ON public.email_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at on loyalty_points
CREATE TRIGGER update_loyalty_points_updated_at
    BEFORE UPDATE ON public.loyalty_points
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA - Loyalty Rewards
-- ============================================

INSERT INTO public.loyalty_rewards (name, description, points_required, type, value, active) VALUES
('5% de Desconto', 'Cupom de 5% OFF em qualquer compra', 100, 'discount', 5, true),
('10% de Desconto', 'Cupom de 10% OFF em qualquer compra', 250, 'discount', 10, true),
('15% de Desconto', 'Cupom de 15% OFF em qualquer compra', 500, 'discount', 15, true),
('20% de Desconto', 'Cupom de 20% OFF em qualquer compra', 1000, 'discount', 20, true),
('Frete Grátis', 'Frete grátis em qualquer pedido', 200, 'free_shipping', 0, true),
('Produto Grátis', 'Escolha um produto de até R$ 50', 800, 'free_product', 50, true),
('Acesso VIP', 'Acesso antecipado a lançamentos', 1500, 'exclusive_access', 0, true),
('Super Desconto 30%', 'Cupom de 30% OFF - Exclusivo Platinum', 2500, 'discount', 30, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- View: Customer loyalty summary
CREATE OR REPLACE VIEW public.customer_loyalty_summary AS
SELECT 
    p.id as customer_id,
    p.email,
    p.name,
    COALESCE(lp.points, 0) as current_points,
    COALESCE(lp.tier, 'bronze') as tier,
    COALESCE(lp.lifetime_points, 0) as lifetime_points,
    p.total_spent,
    p.last_purchase_date,
    CASE 
        WHEN p.last_purchase_date IS NULL THEN 'never_purchased'
        WHEN p.last_purchase_date < NOW() - INTERVAL '90 days' THEN 'high_churn_risk'
        WHEN p.last_purchase_date < NOW() - INTERVAL '60 days' THEN 'medium_churn_risk'
        WHEN p.last_purchase_date < NOW() - INTERVAL '30 days' THEN 'low_churn_risk'
        ELSE 'active'
    END as churn_risk
FROM public.profiles p
LEFT JOIN public.loyalty_points lp ON p.id = lp.customer_id;

-- View: Email campaign performance
CREATE OR REPLACE VIEW public.email_campaign_performance AS
SELECT 
    id,
    name,
    subject,
    segment,
    status,
    sent_count,
    COALESCE(open_rate, 0) as open_rate,
    COALESCE(click_rate, 0) as click_rate,
    sent_at,
    created_at
FROM public.email_campaigns
WHERE status = 'sent'
ORDER BY sent_at DESC;
