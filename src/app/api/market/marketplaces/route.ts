import { NextResponse } from 'next/server'
import { brazilianMarketplaces, calculateFinalPrice } from '@/lib/marketplaces'

/**
 * API para listar todos os marketplaces e suas taxas
 * GET /api/market/marketplaces
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const activeOnly = searchParams.get('active') === 'true'
        const fashionOnly = searchParams.get('fashion') === 'true'

        let marketplaces = brazilianMarketplaces

        if (activeOnly) {
            marketplaces = marketplaces.filter(m => m.active)
        }

        if (fashionOnly) {
            marketplaces = marketplaces.filter(m => m.categories.fashion)
        }

        // Calcula exemplo de taxas para R$ 100
        const example = marketplaces.map(m => ({
            id: m.id,
            name: m.displayName,
            url: m.url,
            popularityRank: m.popularityRank,
            fees: m.fees,
            exampleCalculation: calculateFinalPrice(100, m.id),
        }))

        return NextResponse.json({
            success: true,
            total: marketplaces.length,
            marketplaces: example,
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error('Marketplaces API error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch marketplaces' },
            { status: 500 }
        )
    }
}
