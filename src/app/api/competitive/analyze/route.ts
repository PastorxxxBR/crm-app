import { NextRequest, NextResponse } from 'next/server'
import { analyzeRealCategory, SEARCH_TERMS } from '@/lib/realMLScraperV3'
import { CompetitiveAnalysisRequestSchema } from '@/lib/validation/schemas'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const category = searchParams.get('category') || 'roupas-feminina'
        const limit = parseInt(searchParams.get('limit') || '50')

        // Validar request
        const validatedRequest = CompetitiveAnalysisRequestSchema.parse({
            category,
            limit
        })

        console.log(`🔍 API: Analisando categoria: ${validatedRequest.category}`)

        // Pegar termo de busca
        const searchTerm = SEARCH_TERMS[validatedRequest.category] || validatedRequest.category

        // Buscar dados REAIS do Mercado Livre (com retry e validação)
        const analysis = await analyzeRealCategory(searchTerm)

        console.log(`✅ API: ${analysis.totalProducts} produtos analisados!`)

        return NextResponse.json({
            success: true,
            category: validatedRequest.category,
            searchTerm,
            analysis,
            timestamp: new Date().toISOString(),
            cached: false
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
                'X-Content-Type-Options': 'nosniff',
            }
        })
    } catch (error: any) {
        console.error('❌ API Error:', error)

        // Retornar erro estruturado
        const statusCode = error.name === 'ZodError' ? 400 : 500

        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Erro ao buscar dados',
                details: process.env.NODE_ENV === 'development' ? error.toString() : undefined,
                timestamp: new Date().toISOString()
            },
            { status: statusCode }
        )
    }
}
