import { NextResponse } from 'next/server'
import { enrichCustomerData, segmentCustomer, generateMarketingRecommendations } from '@/lib/customerEnrichment'

/**
 * API para enriquecer dados do cliente
 * POST /api/customers/enrich
 * Body: { name, email, phone }
 */
export async function POST(request: Request) {
    try {
        const { name, email, phone } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: 'Email é obrigatório' },
                { status: 400 }
            )
        }

        // Busca dados nas redes sociais e Google
        const enrichedData = await enrichCustomerData(name, email, phone)

        // Cria segmento
        const segment = segmentCustomer(enrichedData)

        // Gera recomendações de marketing
        const recommendations = generateMarketingRecommendations(enrichedData)

        return NextResponse.json({
            success: true,
            data: {
                ...enrichedData,
                segment,
                recommendations,
            },
            message: 'Dados do cliente enriquecidos com sucesso',
        })
    } catch (error) {
        console.error('Erro ao enriquecer cliente:', error)
        return NextResponse.json(
            { error: 'Erro ao processar dados', details: String(error) },
            { status: 500 }
        )
    }
}
