import { NextRequest, NextResponse } from 'next/server'
import { getTikTokService } from '@/lib/tiktok'

/**
 * Sincronizar produtos do CRM com TikTok
 */
export async function POST(request: NextRequest) {
    try {
        const { products } = await request.json()
        const tiktok = getTikTokService()

        const results = await tiktok.syncAllProducts(products)

        return NextResponse.json({
            success: true,
            results
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}

/**
 * Obter status da sincronização
 */
export async function GET(request: NextRequest) {
    try {
        const tiktok = getTikTokService()
        const connected = await tiktok.testConnection()

        return NextResponse.json({
            success: true,
            connected,
            message: connected ? 'Conectado ao TikTok Shop' : 'Não conectado'
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
