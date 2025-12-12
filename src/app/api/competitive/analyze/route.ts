import { NextRequest, NextResponse } from 'next/server'
import { analyzeRealCategory, SEARCH_TERMS } from '@/lib/realMLScraperV2'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const category = searchParams.get('category') || 'roupas-feminina'

        console.log(`🔍 API: Analisando categoria: ${category}`)

        // Pegar termo de busca
        const searchTerm = SEARCH_TERMS[category] || category

        // Buscar dados REAIS do Mercado Livre
        const analysis = await analyzeRealCategory(searchTerm)

        console.log(`✅ API: ${analysis.totalProducts} produtos analisados!`)

        return NextResponse.json({
            success: true,
            category,
            searchTerm,
            analysis,
            timestamp: new Date().toISOString(),
            cached: false
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600'
            }
        })
    } catch (error: any) {
        console.error('❌ API Error:', error)

        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Erro ao buscar dados',
                details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
            },
            { status: 500 }
        )
    }
}
