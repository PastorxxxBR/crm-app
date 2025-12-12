import { NextResponse } from 'next/server'
import { compareMarketplaceFees } from '@/lib/marketplaces'

/**
 * API para comparar taxas entre marketplaces
 * GET /api/market/fees?price=100
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const price = parseFloat(searchParams.get('price') || '100')

        if (isNaN(price) || price <= 0) {
            return NextResponse.json(
                { error: 'Invalid price' },
                { status: 400 }
            )
        }

        const comparison = compareMarketplaceFees(price)

        // Encontra melhor e pior marketplace
        const best = comparison[0]
        const worst = comparison[comparison.length - 1]

        return NextResponse.json({
            success: true,
            price,
            comparison,
            insights: {
                bestMarketplace: {
                    name: best.marketplace,
                    netProfit: best.netProfit,
                    profitMargin: best.profitMargin.toFixed(2),
                },
                worstMarketplace: {
                    name: worst.marketplace,
                    netProfit: worst.netProfit,
                    profitMargin: worst.profitMargin.toFixed(2),
                },
                difference: best.netProfit - worst.netProfit,
            },
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error('Fees comparison error:', error)
        return NextResponse.json(
            { error: 'Failed to compare fees' },
            { status: 500 }
        )
    }
}
