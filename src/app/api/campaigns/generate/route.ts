import { NextResponse } from 'next/server'
import { campaignAI } from '@/lib/campaignAI'

/**
 * API para gerar campanhas otimizadas com IA
 * POST /api/campaigns/generate
 */
export async function POST(request: Request) {
    try {
        const businessData = await request.json()

        // Valida dados
        if (!businessData.budget || businessData.budget <= 0) {
            return NextResponse.json(
                { error: 'Orçamento inválido' },
                { status: 400 }
            )
        }

        // Gera campanhas com IA
        const campaigns = await campaignAI.analyzeSituationAndSuggestCampaigns(businessData)

        return NextResponse.json({
            success: true,
            campaigns,
            message: `${campaigns.length} campanhas geradas com sucesso`,
        })
    } catch (error) {
        console.error('Erro ao gerar campanhas:', error)
        return NextResponse.json(
            { error: 'Erro ao gerar campanhas', details: String(error) },
            { status: 500 }
        )
    }
}
