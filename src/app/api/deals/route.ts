import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

// GET /api/deals - Listar todos os deals
export async function GET(request: NextRequest) {
    try {
        const supabase = createClient();
        const { searchParams } = new URL(request.url);

        const pipeline_id = searchParams.get('pipeline_id');
        const stage_id = searchParams.get('stage_id');
        const status = searchParams.get('status');
        const assigned_to = searchParams.get('assigned_to');

        let query = supabase
            .from('deals')
            .select(`
        *,
        stage:pipeline_stages(*),
        pipeline:pipelines(*)
      `)
            .order('position', { ascending: true });

        if (pipeline_id) {
            query = query.eq('pipeline_id', pipeline_id);
        }

        if (stage_id) {
            query = query.eq('stage_id', stage_id);
        }

        if (status) {
            query = query.eq('status', status);
        }

        if (assigned_to) {
            query = query.eq('assigned_to', assigned_to);
        }

        const { data: deals, error } = await query;

        if (error) throw error;

        return NextResponse.json(deals);
    } catch (error: any) {
        console.error('Error fetching deals:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch deals' },
            { status: 500 }
        );
    }
}

// POST /api/deals - Criar novo deal
export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();
        const body = await request.json();

        // Se não especificou stage_id, pega o primeiro estágio do pipeline
        let stage_id = body.stage_id;
        if (!stage_id && body.pipeline_id) {
            const { data: firstStage } = await supabase
                .from('pipeline_stages')
                .select('id')
                .eq('pipeline_id', body.pipeline_id)
                .order('position', { ascending: true })
                .limit(1)
                .single();

            stage_id = firstStage?.id;
        }

        const { data: deal, error } = await supabase
            .from('deals')
            .insert({
                pipeline_id: body.pipeline_id,
                stage_id,
                title: body.title,
                description: body.description,
                value: body.value || 0,
                currency: body.currency || 'BRL',
                customer_id: body.customer_id,
                assigned_to: body.assigned_to,
                expected_close_date: body.expected_close_date,
                tags: body.tags,
                custom_fields: body.custom_fields,
            })
            .select(`
        *,
        stage:pipeline_stages(*),
        pipeline:pipelines(*)
      `)
            .single();

        if (error) throw error;

        // Registrar atividade de criação
        await supabase.from('deal_activities').insert({
            deal_id: deal.id,
            activity_type: 'created',
            title: 'Deal criado',
            description: `Deal "${deal.title}" foi criado`,
        });

        return NextResponse.json(deal, { status: 201 });
    } catch (error: any) {
        console.error('Error creating deal:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create deal' },
            { status: 500 }
        );
    }
}
