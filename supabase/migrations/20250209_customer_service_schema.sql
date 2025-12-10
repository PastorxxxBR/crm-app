-- Customer Service Agent Schema
-- Tabela de tickets de atendimento

CREATE TABLE IF NOT EXISTS public.customer_tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_phone TEXT NOT NULL,
  customer_id UUID REFERENCES public.profiles(id),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  category TEXT,
  ai_response TEXT,
  escalated BOOLEAN DEFAULT false,
  assigned_to UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_customer_tickets_status ON public.customer_tickets(status);
CREATE INDEX IF NOT EXISTS idx_customer_tickets_priority ON public.customer_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_customer_tickets_customer_phone ON public.customer_tickets(customer_phone);
CREATE INDEX IF NOT EXISTS idx_customer_tickets_created_at ON public.customer_tickets(created_at DESC);

-- Tabela de interações (histórico de mensagens)
CREATE TABLE IF NOT EXISTS public.customer_interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id UUID REFERENCES public.customer_tickets(id) ON DELETE CASCADE,
  customer_phone TEXT NOT NULL,
  message TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  channel TEXT DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'email', 'phone', 'chat')),
  sent_by TEXT, -- 'customer', 'agent', 'ai'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_interactions_ticket_id ON public.customer_interactions(ticket_id);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_created_at ON public.customer_interactions(created_at DESC);

-- Tabela de FAQ (Perguntas Frequentes)
CREATE TABLE IF NOT EXISTS public.faq_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  keywords TEXT[], -- Array de palavras-chave para matching
  category TEXT,
  active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faq_entries_active ON public.faq_entries(active);
CREATE INDEX IF NOT EXISTS idx_faq_entries_keywords ON public.faq_entries USING GIN(keywords);

-- RLS (Row Level Security)
ALTER TABLE public.customer_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_entries ENABLE ROW LEVEL SECURITY;

-- Políticas (Public para desenvolvimento - ajustar em produção)
CREATE POLICY "Public Read" ON public.customer_tickets FOR SELECT USING (true);
CREATE POLICY "Public Write" ON public.customer_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update" ON public.customer_tickets FOR UPDATE USING (true);

CREATE POLICY "Public Read" ON public.customer_interactions FOR SELECT USING (true);
CREATE POLICY "Public Write" ON public.customer_interactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read" ON public.faq_entries FOR SELECT USING (true);
CREATE POLICY "Public Write" ON public.faq_entries FOR INSERT WITH CHECK (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para customer_tickets
CREATE TRIGGER update_customer_tickets_updated_at
    BEFORE UPDATE ON public.customer_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para faq_entries
CREATE TRIGGER update_faq_entries_updated_at
    BEFORE UPDATE ON public.faq_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir FAQs iniciais
INSERT INTO public.faq_entries (question, answer, keywords, category) VALUES
(
  'Qual o horário de atendimento?',
  '🕐 Nosso horário de atendimento é de Segunda a Sexta, das 9h às 18h. Sábados das 9h às 13h.',
  ARRAY['horário', 'horario', 'funciona', 'aberto', 'atendimento'],
  'geral'
),
(
  'Qual o prazo de entrega?',
  '📦 O prazo de entrega é de 3 a 7 dias úteis para todo o Brasil. Você receberá o código de rastreamento por email.',
  ARRAY['prazo', 'entrega', 'demora', 'quanto tempo', 'dias'],
  'entrega'
),
(
  'Como funciona a troca?',
  '🔄 Aceitamos trocas em até 7 dias após o recebimento. O produto deve estar sem uso, com etiqueta. Entre em contato para solicitar.',
  ARRAY['troca', 'devolução', 'devolver', 'trocar'],
  'troca'
),
(
  'Quais as formas de pagamento?',
  '💳 Aceitamos: Cartão de crédito, PIX, Boleto e Mercado Pago. Parcelamos em até 3x sem juros.',
  ARRAY['pagamento', 'pagar', 'formas', 'cartão', 'pix', 'boleto'],
  'pagamento'
),
(
  'Como funciona o atacado?',
  '📊 ATACADO: Compras acima de 12 peças têm 25% de desconto! De 6 a 11 peças: 15% off. Consulte nosso catálogo atacado.',
  ARRAY['atacado', 'wholesale', 'grade fechada', 'quantidade', 'desconto volume'],
  'atacado'
),
(
  'Como rastrear meu pedido?',
  '🔍 Para rastrear seu pedido, acesse: https://rastreamento.correios.com.br e insira o código que enviamos por email.',
  ARRAY['rastreamento', 'rastrear', 'código', 'onde está', 'pedido'],
  'pedido'
);
