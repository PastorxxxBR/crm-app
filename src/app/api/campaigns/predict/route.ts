import { NextResponse } from 'next/server'
import { campaignAI } from '@/lib/campaignAI'

/**
 * API para prever resultados de campanha
 * POST /api/campaigns/predict
 */
export async function POST(request: Request) {
    try {
        const campaign = await request.json()

        // Prevê resultados
        const prediction = await campaignAI.predictCampaignResults(campaign)

        return NextResponse.json({
            success: true,
            prediction,
            message: 'Previsão gerada com sucesso',
        })
    } catch (error) {
        console.error('Erro ao prever resultados:', error)
        return NextResponse.json(
            { error: 'Erro ao prever resultados', details: String(error) },
            { status: 500 }
        )
    }
}
