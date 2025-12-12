import { NextResponse } from 'next/server'

/**
 * API para análise por segmento (masculino, feminino, infantil)
 * GET /api/market/segments
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const marketplace = searchParams.get('marketplace') || 'mercadolivre'

        // Produtos organizados por segmento
        const segments = {
            masculino: [
                'Camiseta Básica Masculina',
                'Calça Jeans Masculina',
                'Bermuda Masculina',
                'Camisa Social Masculina',
            ],
            feminino: [
                'Vestido Floral',
                'Blusa Social Feminina',
                'Saia Midi',
                'Calça Legging',
            ],
            infantil: [
                'Conjunto Infantil',
                'Macacão Bebê',
                'Camiseta Infantil',
                'Short Infantil',
            ],
        }

        const analysis = await Promise.all(
            Object.entries(segments).map(async ([segment, products]) => {
                // Busca média de preços para produtos deste segmento
                const prices = await Promise.all(
                    products.map(async (productName) => {
                        try {
                            const response = await fetch(
                                `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/market/search?product=${encodeURIComponent(productName)}&marketplace=${marketplace}`,
                                { cache: 'no-store' }
                            )
                            const data = await response.json()
                            return data.stats?.avg || 0
                        } catch {
                            return 0
                        }
                    })
                )

                const validPrices = prices.filter(p => p > 0)
                const avgPrice = validPrices.length > 0
                    ? validPrices.reduce((sum, p) => sum + p, 0) / validPrices.length
                    : 0

                return {
                    segment,
                    productCount: products.length,
                    avgPrice: parseFloat(avgPrice.toFixed(2)),
                    minPrice: Math.min(...validPrices),
                    maxPrice: Math.max(...validPrices),
                    competitorCount: Math.floor(Math.random() * 30) + 15, // Mock
                }
            })
        )

        return NextResponse.json({
            success: true,
            marketplace,
            segments: analysis,
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error('Segments API error:', error)
        return NextResponse.json(
            { error: 'Failed to analyze segments' },
            { status: 500 }
        )
    }
}
