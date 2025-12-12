import { NextResponse } from 'next/server'

/**
 * API para obter análise comparativa de preços
 * Compara seus preços com média do mercado
 * GET /api/market/compare
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const marketplace = searchParams.get('marketplace') || 'mercadolivre'

        // Produtos do seu catálogo (depois vamos buscar do Supabase)
        const myProducts = [
            { id: '1', name: 'Camiseta Básica Masculina', category: 'masculino', myPrice: 49.90, sku: 'CAM-001' },
            { id: '2', name: 'Calça Jeans Masculina', category: 'masculino', myPrice: 129.90, sku: 'CAL-001' },
            { id: '3', name: 'Vestido Floral Feminino', category: 'feminino', myPrice: 89.90, sku: 'VES-001' },
            { id: '4', name: 'Blusa Social Feminina', category: 'feminino', myPrice: 69.90, sku: 'BLU-001' },
            { id: '5', name: 'Conjunto Infantil', category: 'infantil', myPrice: 79.90, sku: 'CON-001' },
        ]

        // Para cada produto, busca preços dos concorrentes
        const comparisons = await Promise.all(
            myProducts.map(async (product) => {
                try {
                    // Busca preços no marketplace
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/market/search?product=${encodeURIComponent(product.name)}&marketplace=${marketplace}`,
                        { cache: 'no-store' }
                    )

                    const data = await response.json()

                    if (!data.success || !data.stats) {
                        return {
                            product: product.name,
                            category: product.category,
                            myPrice: product.myPrice,
                            avgCompetitor: product.myPrice * 0.95, // Fallback
                            margin: -5,
                            status: 'error',
                        }
                    }

                    const avgCompetitor = data.stats.avg
                    const margin = ((product.myPrice - avgCompetitor) / avgCompetitor) * 100

                    return {
                        product: product.name,
                        category: product.category,
                        myPrice: product.myPrice,
                        avgCompetitor,
                        minCompetitor: data.stats.min,
                        maxCompetitor: data.stats.max,
                        margin,
                        competitorCount: data.count,
                        status: margin > 10 ? 'expensive' : margin < -10 ? 'cheap' : 'competitive',
                    }
                } catch (error) {
                    console.error(`Error comparing ${product.name}:`, error)
                    return null
                }
            })
        )

        // Remove nulls e calcula estatísticas gerais
        const validComparisons = comparisons.filter(c => c !== null)

        const avgMargin = validComparisons.reduce((sum, c) => sum + (c?.margin || 0), 0) / validComparisons.length
        const competitiveCount = validComparisons.filter(c => c?.status === 'competitive').length
        const alertCount = validComparisons.filter(c => c?.status === 'expensive' || c?.status === 'cheap').length

        return NextResponse.json({
            success: true,
            marketplace,
            comparisons: validComparisons,
            summary: {
                totalProducts: myProducts.length,
                avgMargin: avgMargin.toFixed(2),
                competitiveProducts: competitiveCount,
                alertCount,
                competitiveness: ((competitiveCount / validComparisons.length) * 100).toFixed(1),
            },
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error('Compare API error:', error)
        return NextResponse.json(
            { error: 'Failed to compare prices', details: String(error) },
            { status: 500 }
        )
    }
}
