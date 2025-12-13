-- Pipeline de Vendas - Schema do Supabase

-- Tabela de Pipelines (múltiplos funis de venda)
CREATE TABLE IF NOT EXISTS pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#8B5CF6',
  is_default BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Estágios (etapas do funil)
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID REFERENCES pipelines(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#10B981',
  position INTEGER DEFAULT 0,
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  is_closed_won BOOLEAN DEFAULT false,
  is_closed_lost BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Negócios/Oportunidades (deals)
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID REFERENCES pipelines(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES pipeline_stages(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  value DECIMAL(15, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'BRL',
  
  -- Relacionamentos
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  assigned_to UUID, -- ID do usuário responsável
  
  -- Datas importantes
  expected_close_date DATE,
  actual_close_date DATE,
  
  -- Status
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost', 'abandoned')),
  lost_reason TEXT,
  
  -- Metadata
  position INTEGER DEFAULT 0,
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de Atividades do Deal (histórico)
CREATE TABLE IF NOT EXISTS deal_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  user_id UUID, -- ID do usuário que fez a ação
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('created', 'updated', 'stage_changed', 'note_added', 'email_sent', 'call_made', 'meeting_scheduled', 'file_attached', 'won', 'lost')),
  title VARCHAR(255),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Produtos do Deal (itens)
CREATE TABLE IF NOT EXISTS deal_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  product_id UUID, -- Referência ao produto (se existir)
  name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity DECIMAL(10, 2) DEFAULT 1,
  unit_price DECIMAL(15, 2) DEFAULT 0,
  discount DECIMAL(5, 2) DEFAULT 0,
  total DECIMAL(15, 2) GENERATED ALWAYS AS (quantity * unit_price * (1 - discount / 100)) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pipelines_position ON pipelines(position);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_pipeline_id ON pipeline_stages(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_position ON pipeline_stages(position);
CREATE INDEX IF NOT EXISTS idx_deals_pipeline_id ON deals(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage_id ON deals(stage_id);
CREATE INDEX IF NOT EXISTS idx_deals_customer_id ON deals(customer_id);
CREATE INDEX IF NOT EXISTS idx_deals_assigned_to ON deals(assigned_to);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at);
CREATE INDEX IF NOT EXISTS idx_deal_activities_deal_id ON deal_activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_products_deal_id ON deal_products(deal_id);

-- Triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pipelines_updated_at BEFORE UPDATE ON pipelines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pipeline_stages_updated_at BEFORE UPDATE ON pipeline_stages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deal_products_updated_at BEFORE UPDATE ON deal_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para registrar mudanças de estágio
CREATE OR REPLACE FUNCTION log_deal_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stage_id IS DISTINCT FROM NEW.stage_id THEN
    INSERT INTO deal_activities (deal_id, activity_type, title, metadata)
    VALUES (
      NEW.id,
      'stage_changed',
      'Estágio alterado',
      jsonb_build_object(
        'old_stage_id', OLD.stage_id,
        'new_stage_id', NEW.stage_id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_deal_stage_change_trigger AFTER UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION log_deal_stage_change();

-- Dados iniciais (pipeline padrão)
INSERT INTO pipelines (name, description, color, is_default, position)
VALUES 
  ('Vendas Principal', 'Pipeline padrão de vendas', '#8B5CF6', true, 0),
  ('Pós-venda', 'Acompanhamento de clientes', '#EC4899', false, 1)
ON CONFLICT DO NOTHING;

-- Estágios do pipeline padrão
INSERT INTO pipeline_stages (pipeline_id, name, description, color, position, probability)
SELECT 
  p.id,
  stage.name,
  stage.description,
  stage.color,
  stage.position,
  stage.probability
FROM pipelines p
CROSS JOIN (
  VALUES
    ('Lead Qualificado', 'Novo lead qualificado', '#3B82F6', 0, 10),
    ('Contato Inicial', 'Primeiro contato realizado', '#8B5CF6', 1, 25),
    ('Proposta Enviada', 'Proposta comercial enviada', '#EC4899', 2, 50),
    ('Negociação', 'Em negociação', '#F59E0B', 3, 75),
    ('Fechamento', 'Pronto para fechar', '#10B981', 4, 90)
) AS stage(name, description, color, position, probability)
WHERE p.is_default = true
ON CONFLICT DO NOTHING;

-- RLS (Row Level Security) - Opcional
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_products ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (todos podem ler e escrever por enquanto)
CREATE POLICY "Enable read access for all users" ON pipelines FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON pipelines FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON pipelines FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON pipelines FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON pipeline_stages FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON pipeline_stages FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON pipeline_stages FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON pipeline_stages FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON deals FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON deals FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON deals FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON deals FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON deal_activities FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON deal_activities FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON deal_products FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON deal_products FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON deal_products FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON deal_products FOR DELETE USING (true);
