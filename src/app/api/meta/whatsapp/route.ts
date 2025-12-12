import { NextResponse } from 'next/server'
import { createMetaClient } from '@/lib/metaClient'

export async function GET() {
    const client = createMetaClient()
    if (!client) {
        return NextResponse.json(
            { error: 'Meta API não configurada' },
            { status: 500 }
        )
    }

    try {
        const businessId = process.env.META_BUSINESS_ID
        if (!businessId) {
            throw new Error('META_BUSINESS_ID não configurado')
        }

        const templates = await client.getWhatsAppTemplates(businessId)

        return NextResponse.json({
            success: true,
            templates,
            totalTemplates: templates.length,
            approvedTemplates: templates.filter((t: any) => t.status === 'APPROVED').length,
        })
    } catch (error: any) {
        console.error('Erro WhatsApp API:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    const client = createMetaClient()
    if (!client) {
        return NextResponse.json(
            { error: 'Meta API não configurada' },
            { status: 500 }
        )
    }

    try {
        const { to, message } = await request.json()
        const phoneNumberId = process.env.META_WHATSAPP_PHONE_ID

        if (!phoneNumberId) {
            throw new Error('META_WHATSAPP_PHONE_ID não configurado')
        }

        const result = await client.sendWhatsAppMessage(phoneNumberId, to, message)

        return NextResponse.json({
            success: true,
            messageId: result.id,
        })
    } catch (error: any) {
        console.error('Erro ao enviar WhatsApp:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
