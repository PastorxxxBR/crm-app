import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

// GET /api/pipelines/[id]/stages - Listar estágios de um pipeline
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient();

        const { data: stages, error } = await supabase
            .from('pipeline_stages')
            .select('*')
            .eq('pipeline_id', params.id)
            .order('position', { ascending: true });

        if (error) throw error;

        return NextResponse.json(stages);
    } catch (error: any) {
        console.error('Error fetching stages:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch stages' },
            { status: 500 }
        );
    }
}

// POST /api/pipelines/[id]/stages - Criar novo estágio
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient();
        const body = await request.json();

        const { data: stage, error } = await supabase
            .from('pipeline_stages')
            .insert({
                pipeline_id: params.id,
                name: body.name,
                description: body.description,
                color: body.color || '#10B981',
                probability: body.probability || 50,
                is_closed_won: body.is_closed_won || false,
                is_closed_lost: body.is_closed_lost || false,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(stage, { status: 201 });
    } catch (error: any) {
        console.error('Error creating stage:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create stage' },
            { status: 500 }
        );
    }
}
