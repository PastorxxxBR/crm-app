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
        const instagramId = process.env.META_INSTAGRAM_ID
        if (!instagramId) {
            throw new Error('META_INSTAGRAM_ID não configurado')
        }

        const [insights, media] = await Promise.all([
            client.getInstagramInsights(instagramId),
            client.getInstagramMedia(instagramId, 12),
        ])

        return NextResponse.json({
            success: true,
            insights,
            recentPosts: media,
        })
    } catch (error: any) {
        console.error('Erro Instagram API:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
