// Types para o Sistema de Tarefas

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    assigned_to?: string;
    created_by?: string;
    deal_id?: string;
    customer_id?: string;
    due_date?: string;
    completed_at?: string;
    tags?: string[];
    custom_fields?: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface TaskWithRelations extends Task {
    checklist_items?: TaskChecklistItem[];
    comments?: TaskComment[];
    attachments?: TaskAttachment[];
    deal?: {
        id: string;
        title: string;
    };
    customer?: {
        id: string;
        name: string;
    };
}

export interface TaskChecklistItem {
    id: string;
    task_id: string;
    title: string;
    completed: boolean;
    position: number;
    created_at: string;
    updated_at: string;
}

export interface TaskComment {
    id: string;
    task_id: string;
    user_id?: string;
    comment: string;
    created_at: string;
    updated_at: string;
}

export interface TaskAttachment {
    id: string;
    task_id: string;
    file_name: string;
    file_url: string;
    file_type?: string;
    file_size?: number;
    uploaded_by?: string;
    created_at: string;
}

// DTOs
export interface CreateTaskDTO {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigned_to?: string;
    deal_id?: string;
    customer_id?: string;
    due_date?: string;
    tags?: string[];
    custom_fields?: Record<string, any>;
}

export interface UpdateTaskDTO {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigned_to?: string;
    deal_id?: string;
    customer_id?: string;
    due_date?: string;
    tags?: string[];
    custom_fields?: Record<string, any>;
}

export interface CreateChecklistItemDTO {
    task_id: string;
    title: string;
    position?: number;
}

export interface CreateCommentDTO {
    task_id: string;
    comment: string;
}
