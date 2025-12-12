import { NextResponse } from 'next/server'
import { metaValidator } from '@/lib/metaCompliance'

export async function POST(request: Request) {
    try {
        const { campaign } = await request.json()

        const compliance = metaValidator.validateCampaign(campaign)

        return NextResponse.json({
            success: true,
            compliance,
            report: metaValidator.generateComplianceReport(compliance),
        })
    } catch (error) {
        console.error('Erro ao validar campanha:', error)
        return NextResponse.json(
            { success: false, error: 'Erro ao validar campanha' },
            { status: 500 }
        )
    }
}
