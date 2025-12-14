import { NextRequest, NextResponse } from 'next/server';
import { processLead } from '@/lib/lead-processor';

// Webhook do Meta (Facebook + Instagram)
// Recebe eventos de comentários, mensagens e cliques em anúncios

// GET - Verificação do webhook (Meta exige isso)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'meu_token_secreto';

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('Webhook verified!');
        return new NextResponse(challenge, { status: 200 });
    }

    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

// POST - Recebe eventos do Facebook/Instagram
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log('Meta webhook received:', JSON.stringify(body, null, 2));

        // Processar cada entrada
        for (const entry of body.entry || []) {
            // Processar mudanças
            for (const change of entry.changes || []) {
                await processChange(change, entry);
            }

            // Processar mensagens (Messenger/Instagram)
            for (const messaging of entry.messaging || []) {
                await processMessaging(messaging, entry);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error processing Meta webhook:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Processa mudanças (comentários, reações, etc)
async function processChange(change: any, entry: any) {
    const { field, value } = change;

    // Comentário em post/foto/vídeo
    if (field === 'feed' && value.item === 'comment') {
        await processComment(value, 'facebook');
    }

    // Comentário no Instagram
    if (field === 'comments' && value.media) {
        await processComment(value, 'instagram');
    }

    // Lead Ads (formulário de anúncio)
    if (field === 'leadgen' && value.leadgen_id) {
        await processLeadAd(value);
    }
}

// Processa mensagens (Messenger/Instagram DM)
async function processMessaging(messaging: any, entry: any) {
    const { sender, message } = messaging;

    if (!sender || !message) return;

    // Determinar se é Facebook ou Instagram
    const source = entry.id.includes('instagram') ? 'instagram' : 'facebook';

    // Buscar informações do usuário
    const userInfo = await getUserInfo(sender.id, source);

    if (!userInfo) return;

    // Processar lead
    await processLead({
        name: userInfo.name,
        phone: userInfo.phone,
        email: userInfo.email,
        source,
        sourceId: sender.id,
        message: message.text || 'Mensagem recebida',
        metadata: {
            message_id: message.mid,
            timestamp: messaging.timestamp,
        },
    });
}

// Processa comentário
async function processComment(value: any, source: 'facebook' | 'instagram') {
    const { from, message, comment_id } = value;

    if (!from || !message) return;

    // Buscar informações do usuário
    const userInfo = await getUserInfo(from.id, source);

    if (!userInfo) return;

    // Processar lead
    await processLead({
        name: userInfo.name,
        phone: userInfo.phone,
        email: userInfo.email,
        source,
        sourceId: from.id,
        message: message,
        metadata: {
            comment_id,
            post_id: value.post_id || value.media_id,
        },
    });

    // Responder comentário automaticamente (opcional)
    if (process.env.META_AUTO_REPLY === 'true') {
        await replyToComment(comment_id, source);
    }
}

// Processa Lead Ad (formulário de anúncio)
async function processLeadAd(value: any) {
    const { leadgen_id, ad_id, form_id } = value;

    try {
        // Buscar dados do lead no Facebook
        const leadData = await getLeadAdData(leadgen_id);

        if (!leadData) return;

        // Processar lead
        await processLead({
            name: leadData.name,
            phone: leadData.phone,
            email: leadData.email,
            source: 'facebook',
            sourceId: leadgen_id,
            message: 'Lead capturado via anúncio',
            metadata: {
                ad_id,
                form_id,
                ...leadData.custom_fields,
            },
        });
    } catch (error) {
        console.error('Error processing lead ad:', error);
    }
}

// Busca informações do usuário via Graph API
async function getUserInfo(userId: string, source: 'facebook' | 'instagram') {
    try {
        const accessToken = process.env.META_ACCESS_TOKEN;

        const url = `https://graph.facebook.com/v18.0/${userId}?fields=name,email&access_token=${accessToken}`;

        const response = await fetch(url);
        const data = await response.json();

        return {
            name: data.name || 'Usuário',
            email: data.email,
            phone: undefined, // Meta não fornece telefone via API pública
        };
    } catch (error) {
        console.error('Error fetching user info:', error);
        return null;
    }
}

// Busca dados do Lead Ad
async function getLeadAdData(leadgenId: string) {
    try {
        const accessToken = process.env.META_ACCESS_TOKEN;

        const url = `https://graph.facebook.com/v18.0/${leadgenId}?access_token=${accessToken}`;

        const response = await fetch(url);
        const data = await response.json();

        // Extrair campos do formulário
        const fields: Record<string, any> = {};
        for (const field of data.field_data || []) {
            fields[field.name] = field.values[0];
        }

        return {
            name: fields.full_name || fields.first_name || 'Lead',
            email: fields.email,
            phone: fields.phone_number,
            custom_fields: fields,
        };
    } catch (error) {
        console.error('Error fetching lead ad data:', error);
        return null;
    }
}

// Responde comentário automaticamente
async function replyToComment(commentId: string, source: 'facebook' | 'instagram') {
    try {
        const accessToken = process.env.META_ACCESS_TOKEN;

        const messages = {
            facebook: 'Olá! Obrigado pelo seu interesse! 😊 Vou te enviar mais informações no WhatsApp!',
            instagram: 'Oi! Adorei seu comentário! 💕 Te mando mais detalhes no direct!',
        };

        const url = `https://graph.facebook.com/v18.0/${commentId}/comments`;

        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: messages[source],
                access_token: accessToken,
            }),
        });
    } catch (error) {
        console.error('Error replying to comment:', error);
    }
}
