import { NextRequest, NextResponse } from 'next/server'
import { GoogleMasterAgent } from '@/agents/google-master'

export async function GET(request: NextRequest) {
    try {
        const agent = new GoogleMasterAgent()
        const report = await agent.generateGoogleOpportunitiesReport()

        return NextResponse.json({
            success: true,
            report,
            generatedAt: new Date().toISOString()
        })
    } catch (error: any) {
        console.error('Erro ao gerar relatório:', error)
        return NextResponse.json(
            { error: error.message || 'Erro ao gerar relatório' },
            { status: 500 }
        )
    }
}
