import { NextRequest, NextResponse } from 'next/server'
import { getRealisticData } from '@/lib/realisticMLData'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const category = searchParams.get('category') || 'roupas-feminina'

        console.log(`🔍 Buscando: ${category}`)

        // Usar dados realistas
        const analysis = getRealisticData(category)

        console.log(`✅ ${analysis.totalProducts} produtos carregados!`)

        return NextResponse.json({
            success: true,
            category,
            analysis,
            timestamp: new Date().toISOString()
        })
    } catch (error: any) {
        console.error('❌ Erro:', error)
        return NextResponse.json(
            {
                error: error.message || 'Erro ao buscar',
                details: error.toString()
            },
            { status: 500 }
        )
    }
}
