// Types para o Pipeline de Vendas

export interface Pipeline {
    id: string;
    name: string;
    description?: string;
    color: string;
    is_default: boolean;
    position: number;
    created_at: string;
    updated_at: string;
}

export interface PipelineStage {
    id: string;
    pipeline_id: string;
    name: string;
    description?: string;
    color: string;
    position: number;
    probability: number; // 0-100
    is_closed_won: boolean;
    is_closed_lost: boolean;
    created_at: string;
    updated_at: string;
}

export type DealStatus = 'open' | 'won' | 'lost' | 'abandoned';

export type DealActivityType =
    | 'created'
    | 'updated'
    | 'stage_changed'
    | 'note_added'
    | 'email_sent'
    | 'call_made'
    | 'meeting_scheduled'
    | 'file_attached'
    | 'won'
    | 'lost';

export interface Deal {
    id: string;
    pipeline_id: string;
    stage_id: string | null;
    title: string;
    description?: string;
    value: number;
    currency: string;

    // Relacionamentos
    customer_id?: string;
    assigned_to?: string;

    // Datas
    expected_close_date?: string;
    actual_close_date?: string;

    // Status
    status: DealStatus;
    lost_reason?: string;

    // Metadata
    position: number;
    tags?: string[];
    custom_fields?: Record<string, any>;

    // Timestamps
    created_at: string;
    updated_at: string;
    closed_at?: string;
}

export interface DealWithRelations extends Deal {
    customer?: {
        id: string;
        name: string;
        email?: string;
        phone?: string;
    };
    stage?: PipelineStage;
    pipeline?: Pipeline;
    products?: DealProduct[];
    activities?: DealActivity[];
}

export interface DealActivity {
    id: string;
    deal_id: string;
    user_id?: string;
    activity_type: DealActivityType;
    title?: string;
    description?: string;
    metadata?: Record<string, any>;
    created_at: string;
}

export interface DealProduct {
    id: string;
    deal_id: string;
    product_id?: string;
    name: string;
    description?: string;
    quantity: number;
    unit_price: number;
    discount: number;
    total: number;
    created_at: string;
    updated_at: string;
}

// DTOs para criação e atualização

export interface CreateDealDTO {
    pipeline_id: string;
    stage_id?: string;
    title: string;
    description?: string;
    value?: number;
    currency?: string;
    customer_id?: string;
    assigned_to?: string;
    expected_close_date?: string;
    tags?: string[];
    custom_fields?: Record<string, any>;
}

export interface UpdateDealDTO {
    title?: string;
    description?: string;
    value?: number;
    stage_id?: string;
    customer_id?: string;
    assigned_to?: string;
    expected_close_date?: string;
    status?: DealStatus;
    lost_reason?: string;
    tags?: string[];
    custom_fields?: Record<string, any>;
}

export interface CreatePipelineDTO {
    name: string;
    description?: string;
    color?: string;
    is_default?: boolean;
}

export interface CreateStageDTO {
    pipeline_id: string;
    name: string;
    description?: string;
    color?: string;
    probability?: number;
    is_closed_won?: boolean;
    is_closed_lost?: boolean;
}

// Tipos para o componente Kanban

export interface KanbanColumn {
    id: string;
    title: string;
    color: string;
    deals: Deal[];
    totalValue: number;
    count: number;
}

export interface DragEndEvent {
    active: {
        id: string;
        data: {
            current?: {
                deal: Deal;
                columnId: string;
            };
        };
    };
    over: {
        id: string;
        data: {
            current?: {
                columnId: string;
            };
        };
    } | null;
}

// Estatísticas do Pipeline

export interface PipelineStats {
    total_deals: number;
    total_value: number;
    won_deals: number;
    won_value: number;
    lost_deals: number;
    lost_value: number;
    open_deals: number;
    open_value: number;
    conversion_rate: number;
    average_deal_value: number;
    average_time_to_close: number; // em dias
}

export interface StageStats {
    stage_id: string;
    stage_name: string;
    deals_count: number;
    total_value: number;
    conversion_rate: number;
    average_time_in_stage: number; // em dias
}
