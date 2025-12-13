import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

// GET /api/tasks - Listar todas as tarefas
export async function GET(request: NextRequest) {
    try {
        const supabase = createClient();
        const { searchParams } = new URL(request.url);

        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const assigned_to = searchParams.get('assigned_to');
        const deal_id = searchParams.get('deal_id');

        let query = supabase
            .from('tasks')
            .select(`
        *,
        checklist_items:task_checklist_items(*),
        deal:deals(id, title),
        customer:customers(id, name)
      `)
            .order('created_at', { ascending: false });

        if (status) query = query.eq('status', status);
        if (priority) query = query.eq('priority', priority);
        if (assigned_to) query = query.eq('assigned_to', assigned_to);
        if (deal_id) query = query.eq('deal_id', deal_id);

        const { data: tasks, error } = await query;

        if (error) throw error;

        return NextResponse.json(tasks);
    } catch (error: any) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch tasks' },
            { status: 500 }
        );
    }
}

// POST /api/tasks - Criar nova tarefa
export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();
        const body = await request.json();

        const { data: task, error } = await supabase
            .from('tasks')
            .insert({
                title: body.title,
                description: body.description,
                status: body.status || 'pending',
                priority: body.priority || 'medium',
                assigned_to: body.assigned_to,
                deal_id: body.deal_id,
                customer_id: body.customer_id,
                due_date: body.due_date,
                tags: body.tags,
                custom_fields: body.custom_fields,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(task, { status: 201 });
    } catch (error: any) {
        console.error('Error creating task:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create task' },
            { status: 500 }
        );
    }
}
