import { NextResponse } from 'next/server'
import { competitiveAgent } from '@/agents/competitive-intelligence'

export async function GET() {
    try {
        console.log('📊 Analisando TODAS as categorias...')

        const allAnalysis = await competitiveAgent.analyzeAllCategories()

        return NextResponse.json({
            success: true,
            categories: allAnalysis,
            totalCategories: Object.keys(allAnalysis).length,
            timestamp: new Date().toISOString()
        })
    } catch (error: any) {
        console.error('Erro ao analisar categorias:', error)
        return NextResponse.json(
            { error: error.message || 'Erro ao analisar categorias' },
            { status: 500 }
        )
    }
}
