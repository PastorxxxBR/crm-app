import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

// GET /api/deals/[id] - Buscar deal específico
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient();

        const { data: deal, error } = await supabase
            .from('deals')
            .select(`
        *,
        stage:pipeline_stages(*),
        pipeline:pipelines(*),
        products:deal_products(*),
        activities:deal_activities(*)
      `)
            .eq('id', params.id)
            .single();

        if (error) throw error;

        if (!deal) {
            return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
        }

        return NextResponse.json(deal);
    } catch (error: any) {
        console.error('Error fetching deal:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch deal' },
            { status: 500 }
        );
    }
}

// PATCH /api/deals/[id] - Atualizar deal
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient();
        const body = await request.json();

        // Buscar deal atual para comparar mudanças
        const { data: currentDeal } = await supabase
            .from('deals')
            .select('*')
            .eq('id', params.id)
            .single();

        if (!currentDeal) {
            return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
        }

        // Atualizar deal
        const { data: deal, error } = await supabase
            .from('deals')
            .update({
                title: body.title,
                description: body.description,
                value: body.value,
                stage_id: body.stage_id,
                customer_id: body.customer_id,
                assigned_to: body.assigned_to,
                expected_close_date: body.expected_close_date,
                status: body.status,
                lost_reason: body.lost_reason,
                tags: body.tags,
                custom_fields: body.custom_fields,
                position: body.position,
            })
            .eq('id', params.id)
            .select(`
        *,
        stage:pipeline_stages(*),
        pipeline:pipelines(*)
      `)
            .single();

        if (error) throw error;

        // Registrar atividade se mudou de estágio
        if (body.stage_id && body.stage_id !== currentDeal.stage_id) {
            await supabase.from('deal_activities').insert({
                deal_id: deal.id,
                activity_type: 'stage_changed',
                title: 'Estágio alterado',
                metadata: {
                    old_stage_id: currentDeal.stage_id,
                    new_stage_id: body.stage_id,
                },
            });
        }

        // Registrar atividade se mudou de status
        if (body.status && body.status !== currentDeal.status) {
            if (body.status === 'won') {
                await supabase.from('deal_activities').insert({
                    deal_id: deal.id,
                    activity_type: 'won',
                    title: 'Deal ganho! 🎉',
                    description: `Deal "${deal.title}" foi fechado com sucesso`,
                });

                // Atualizar data de fechamento
                await supabase
                    .from('deals')
                    .update({ actual_close_date: new Date().toISOString(), closed_at: new Date().toISOString() })
                    .eq('id', deal.id);
            } else if (body.status === 'lost') {
                await supabase.from('deal_activities').insert({
                    deal_id: deal.id,
                    activity_type: 'lost',
                    title: 'Deal perdido',
                    description: body.lost_reason || 'Motivo não especificado',
                });

                // Atualizar data de fechamento
                await supabase
                    .from('deals')
                    .update({ closed_at: new Date().toISOString() })
                    .eq('id', deal.id);
            }
        }

        return NextResponse.json(deal);
    } catch (error: any) {
        console.error('Error updating deal:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update deal' },
            { status: 500 }
        );
    }
}

// DELETE /api/deals/[id] - Deletar deal
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient();

        const { error } = await supabase.from('deals').delete().eq('id', params.id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting deal:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete deal' },
            { status: 500 }
        );
    }
}
