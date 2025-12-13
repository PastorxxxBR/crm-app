-- Calendar Events - Schema do Supabase

-- Tabela de Eventos do Calendário
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Datas e Horários
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  all_day BOOLEAN DEFAULT false,
  
  -- Tipo e Categoria
  event_type VARCHAR(50) DEFAULT 'meeting' CHECK (event_type IN ('meeting', 'call', 'task', 'reminder', 'other')),
  category VARCHAR(100),
  
  -- Relacionamentos
  created_by UUID,
  participants UUID[], -- Array de IDs de usuários
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  
  -- Localização
  location VARCHAR(255),
  meeting_url TEXT,
  
  -- Recorrência
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT, -- RRULE format
  
  -- Lembretes
  reminder_minutes INTEGER, -- Minutos antes do evento
  
  -- Google Calendar Integration
  google_calendar_id VARCHAR(255),
  google_event_id VARCHAR(255),
  
  -- Metadata
  color VARCHAR(7) DEFAULT '#8B5CF6',
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_date ON calendar_events(start_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_end_date ON calendar_events(end_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_created_by ON calendar_events(created_by);
CREATE INDEX IF NOT EXISTS idx_calendar_events_deal_id ON calendar_events(deal_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_customer_id ON calendar_events(customer_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_task_id ON calendar_events(task_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_google_event_id ON calendar_events(google_event_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Enable read access for all users" ON calendar_events FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON calendar_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON calendar_events FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON calendar_events FOR DELETE USING (true);
