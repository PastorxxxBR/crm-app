import { NextResponse } from 'next/server'
import { googleMerchant } from '@/lib/googleMerchant'

export async function GET() {
    try {
        const stats = await googleMerchant.getStats()

        return NextResponse.json({
            success: true,
            merchantId: '699242218',
            stats,
            timestamp: new Date().toISOString()
        })
    } catch (error: any) {
        console.error('Erro ao buscar estatísticas:', error)
        return NextResponse.json(
            { error: error.message || 'Erro ao buscar estatísticas' },
            { status: 500 }
        )
    }
}
