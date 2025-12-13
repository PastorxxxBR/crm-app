import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

// GET /api/pipelines - Listar todos os pipelines
export async function GET() {
    try {
        const supabase = createClient();

        const { data: pipelines, error } = await supabase
            .from('pipelines')
            .select(`
        *,
        stages:pipeline_stages(*)
      `)
            .order('position', { ascending: true });

        if (error) throw error;

        return NextResponse.json(pipelines);
    } catch (error: any) {
        console.error('Error fetching pipelines:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch pipelines' },
            { status: 500 }
        );
    }
}

// POST /api/pipelines - Criar novo pipeline
export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();
        const body = await request.json();

        const { data: pipeline, error } = await supabase
            .from('pipelines')
            .insert({
                name: body.name,
                description: body.description,
                color: body.color || '#8B5CF6',
                is_default: body.is_default || false,
            })
            .select()
            .single();

        if (error) throw error;

        // Criar estágios padrão se solicitado
        if (body.create_default_stages) {
            const defaultStages = [
                { name: 'Lead Qualificado', color: '#3B82F6', position: 0, probability: 10 },
                { name: 'Contato Inicial', color: '#8B5CF6', position: 1, probability: 25 },
                { name: 'Proposta Enviada', color: '#EC4899', position: 2, probability: 50 },
                { name: 'Negociação', color: '#F59E0B', position: 3, probability: 75 },
                { name: 'Fechamento', color: '#10B981', position: 4, probability: 90 },
            ];

            await supabase.from('pipeline_stages').insert(
                defaultStages.map((stage) => ({
                    ...stage,
                    pipeline_id: pipeline.id,
                }))
            );
        }

        return NextResponse.json(pipeline, { status: 201 });
    } catch (error: any) {
        console.error('Error creating pipeline:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create pipeline' },
            { status: 500 }
        );
    }
}
