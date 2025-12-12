import { NextResponse } from 'next/server'
import { realDataFetcher } from '@/lib/realDataFetcher'

export async function GET() {
    try {
        console.log('🔄 Buscando dados REAIS do site...')

        const [products, stats, trends, dashboardData] = await Promise.all([
            realDataFetcher.fetchRealProducts(),
            realDataFetcher.fetchRealStats(),
            realDataFetcher.fetchRealTrends(),
            realDataFetcher.generateRealDashboardData()
        ])

        return NextResponse.json({
            success: true,
            data: {
                products: products.products,
                stats,
                trends,
                dashboard: dashboardData,
                lastUpdated: new Date().toISOString()
            },
            message: `${products.totalProducts} produtos reais encontrados!`
        })
    } catch (error: any) {
        console.error('Erro ao buscar dados reais:', error)
        return NextResponse.json(
            { error: error.message || 'Erro ao buscar dados reais' },
            { status: 500 }
        )
    }
}
