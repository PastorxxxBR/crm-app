import { NextResponse } from 'next/server'
import { mercadoLivreService } from '@/lib/mercadoLivre'

export async function GET() {
    try {
        console.log('🔍 Buscando dados REAIS do Mercado Livre...')

        const report = await mercadoLivreService.generateReport()

        return NextResponse.json({
            success: true,
            marketplace: 'Mercado Livre',
            data: report,
            message: `${report.products.length} produtos e ${report.orders.length} pedidos encontrados!`,
            timestamp: new Date().toISOString()
        })
    } catch (error: any) {
        console.error('Erro ao buscar dados do Mercado Livre:', error)
        return NextResponse.json(
            {
                error: error.message || 'Erro ao buscar dados do Mercado Livre',
                marketplace: 'Mercado Livre'
            },
            { status: 500 }
        )
    }
}
