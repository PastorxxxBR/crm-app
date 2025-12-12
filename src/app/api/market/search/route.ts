import { NextResponse } from 'next/server'
import { searchGoogleForProducts, extractPriceFromResult, scrapeMarketplace, calculatePriceStats } from '@/lib/marketScraper'

/**
 * API para buscar preços de um produto específico em um marketplace
 * GET /api/market/search?product=camiseta&marketplace=mercadolivre
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const product = searchParams.get('product')
        const marketplace = searchParams.get('marketplace') || 'mercadolivre'

        if (!product) {
            return NextResponse.json(
                { error: 'Product name is required' },
                { status: 400 }
            )
        }

        // Tenta Google API primeiro
        let results = await searchGoogleForProducts(product, marketplace)

        // Se não tiver API configurada, usa scraping/mock
        if (results.length === 0) {
            results = await scrapeMarketplace(product, marketplace)
        } else {
            // Extrai preços dos resultados do Google
            results = results.map(item => ({
                title: item.title,
                price: extractPriceFromResult(item, marketplace),
                seller: extractSellerName(item.displayLink),
                url: item.link,
                marketplace,
            })).filter(r => r.price !== null)
        }

        // Calcula estatísticas
        const prices = results.map(r => r.price).filter(p => p > 0)
        const stats = calculatePriceStats(prices)

        return NextResponse.json({
            success: true,
            product,
            marketplace,
            results,
            stats,
            count: results.length,
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error('Market search error:', error)
        return NextResponse.json(
            { error: 'Failed to search marketplace' },
            { status: 500 }
        )
    }
}

function extractSellerName(domain: string): string {
    return domain.replace(/^www\./, '').split('.')[0]
}
