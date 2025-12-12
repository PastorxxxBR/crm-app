import { NextResponse } from 'next/server'
import { googleMerchant } from '@/lib/googleMerchant'

export async function GET() {
    try {
        console.log('🔍 Buscando produtos REAIS do Google Merchant Center...')

        const report = await googleMerchant.generateReport()

        return NextResponse.json({
            success: true,
            merchantId: '699242218',
            data: report,
            message: `${report.products.length} produtos reais encontrados!`,
            timestamp: new Date().toISOString()
        })
    } catch (error: any) {
        console.error('Erro ao buscar dados do Merchant Center:', error)
        return NextResponse.json(
            {
                error: error.message || 'Erro ao buscar dados do Merchant Center',
                merchantId: '699242218'
            },
            { status: 500 }
        )
    }
}
