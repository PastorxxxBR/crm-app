// Lead Processor - Processa leads de todas as fontes
// Cria deals automaticamente e envia mensagens no WhatsApp

import { createClient } from '@/lib/supabase';
import { getEvolutionAPI, formatPhoneNumber } from './evolution-api';

export interface LeadData {
    name: string;
    phone?: string;
    email?: string;
    source: 'facebook' | 'instagram' | 'youtube' | 'whatsapp' | 'website';
    sourceId: string; // ID do Facebook, Instagram, etc
    message?: string; // Comentário ou mensagem original
    metadata?: Record<string, any>;
}

export interface ProcessLeadResult {
    success: boolean;
    dealId?: string;
    messageSent?: boolean;
    error?: string;
}

export async function processLead(leadData: LeadData): Promise<ProcessLeadResult> {
    try {
        const supabase = createClient();

        // 1. Verificar se lead já existe (deduplicação)
        const existingLead = await findExistingLead(leadData);
        if (existingLead) {
            console.log('Lead already exists:', existingLead.id);
            return {
                success: true,
                dealId: existingLead.id,
                messageSent: false,
            };
        }

        // 2. Buscar pipeline padrão
        const { data: pipeline } = await supabase
            .from('pipelines')
            .select('id')
            .eq('is_default', true)
            .single();

        if (!pipeline) {
            throw new Error('No default pipeline found');
        }

        // 3. Buscar primeiro estágio
        const { data: firstStage } = await supabase
            .from('pipeline_stages')
            .select('id')
            .eq('pipeline_id', pipeline.id)
            .order('position', { ascending: true })
            .limit(1)
            .single();

        if (!firstStage) {
            throw new Error('No stages found in pipeline');
        }

        // 4. Criar deal
        const { data: deal, error: dealError } = await supabase
            .from('deals')
            .insert({
                pipeline_id: pipeline.id,
                stage_id: firstStage.id,
                title: `${leadData.name} - ${getSourceLabel(leadData.source)}`,
                description: leadData.message || `Lead capturado via ${leadData.source}`,
                value: 0,
                tags: [leadData.source, 'lead-automatico'],
                custom_fields: {
                    source: leadData.source,
                    source_id: leadData.sourceId,
                    captured_at: new Date().toISOString(),
                    ...leadData.metadata,
                },
            })
            .select()
            .single();

        if (dealError) throw dealError;

        // 5. Registrar atividade
        await supabase.from('deal_activities').insert({
            deal_id: deal.id,
            activity_type: 'created',
            title: 'Lead capturado automaticamente',
            description: `Lead capturado via ${leadData.source}`,
            metadata: {
                source: leadData.source,
                original_message: leadData.message,
            },
        });

        // 6. Enviar mensagem no WhatsApp (se tiver telefone)
        let messageSent = false;
        if (leadData.phone) {
            const evolutionAPI = getEvolutionAPI();
            const formattedPhone = formatPhoneNumber(leadData.phone);

            // Verificar se número existe no WhatsApp
            const numberExists = await evolutionAPI.checkNumber(formattedPhone);

            if (numberExists) {
                const result = await evolutionAPI.sendWelcomeMessage(
                    formattedPhone,
                    leadData.name,
                    leadData.source
                );
                messageSent = result.success;

                // Registrar envio de mensagem
                if (messageSent) {
                    await supabase.from('deal_activities').insert({
                        deal_id: deal.id,
                        activity_type: 'whatsapp_sent',
                        title: 'Mensagem de boas-vindas enviada',
                        description: 'Mensagem automática enviada via WhatsApp',
                    });
                }
            }
        }

        // 7. Criar tarefa de follow-up para 2 dias
        await supabase.from('tasks').insert({
            title: `Follow-up: ${leadData.name}`,
            description: `Fazer follow-up com lead capturado via ${leadData.source}`,
            deal_id: deal.id,
            priority: 'medium',
            due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            tags: ['follow-up', 'lead-automatico'],
        });

        return {
            success: true,
            dealId: deal.id,
            messageSent,
        };
    } catch (error: any) {
        console.error('Error processing lead:', error);
        return {
            success: false,
            error: error.message,
        };
    }
}

async function findExistingLead(leadData: LeadData): Promise<any> {
    const supabase = createClient();

    // Buscar por source_id
    const { data } = await supabase
        .from('deals')
        .select('id')
        .eq('custom_fields->>source', leadData.source)
        .eq('custom_fields->>source_id', leadData.sourceId)
        .single();

    return data;
}

function getSourceLabel(source: string): string {
    const labels: Record<string, string> = {
        facebook: 'Facebook',
        instagram: 'Instagram',
        youtube: 'YouTube',
        whatsapp: 'WhatsApp',
        website: 'Website',
    };
    return labels[source] || source;
}

// Função para enviar catálogo após 1 hora
export async function sendCatalogToLead(dealId: string, phone: string) {
    try {
        const evolutionAPI = getEvolutionAPI();
        const formattedPhone = formatPhoneNumber(phone);

        await evolutionAPI.sendCatalog(formattedPhone);

        // Registrar atividade
        const supabase = createClient();
        await supabase.from('deal_activities').insert({
            deal_id: dealId,
            activity_type: 'catalog_sent',
            title: 'Catálogo enviado',
            description: 'Catálogo de produtos enviado via WhatsApp',
        });

        return { success: true };
    } catch (error) {
        console.error('Error sending catalog:', error);
        return { success: false };
    }
}
