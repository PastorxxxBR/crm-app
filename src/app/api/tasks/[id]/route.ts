import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

// GET /api/tasks/[id] - Buscar tarefa específica
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient();

        const { data: task, error } = await supabase
            .from('tasks')
            .select(`
        *,
        checklist_items:task_checklist_items(*),
        comments:task_comments(*),
        attachments:task_attachments(*),
        deal:deals(id, title),
        customer:customers(id, name)
      `)
            .eq('id', params.id)
            .single();

        if (error) throw error;

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        return NextResponse.json(task);
    } catch (error: any) {
        console.error('Error fetching task:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch task' },
            { status: 500 }
        );
    }
}

// PATCH /api/tasks/[id] - Atualizar tarefa
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient();
        const body = await request.json();

        const { data: task, error } = await supabase
            .from('tasks')
            .update({
                title: body.title,
                description: body.description,
                status: body.status,
                priority: body.priority,
                assigned_to: body.assigned_to,
                deal_id: body.deal_id,
                customer_id: body.customer_id,
                due_date: body.due_date,
                tags: body.tags,
                custom_fields: body.custom_fields,
            })
            .eq('id', params.id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(task);
    } catch (error: any) {
        console.error('Error updating task:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update task' },
            { status: 500 }
        );
    }
}

// DELETE /api/tasks/[id] - Deletar tarefa
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient();

        const { error } = await supabase.from('tasks').delete().eq('id', params.id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting task:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete task' },
            { status: 500 }
        );
    }
}
