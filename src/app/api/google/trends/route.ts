import { NextRequest, NextResponse } from 'next/server'
import { GoogleMasterAgent } from '@/agents/google-master'

export async function POST(request: NextRequest) {
    try {
        const { category } = await request.json()

        if (!category) {
            return NextResponse.json(
                { error: 'Categoria é obrigatória' },
                { status: 400 }
            )
        }

        const agent = new GoogleMasterAgent()
        const trends = await agent.analyzeFashionTrends(category)

        return NextResponse.json({
            success: true,
            category,
            trends,
            analyzedAt: new Date().toISOString()
        })
    } catch (error: any) {
        console.error('Erro ao analisar tendências:', error)
        return NextResponse.json(
            { error: error.message || 'Erro ao analisar tendências' },
            { status: 500 }
        )
    }
}
