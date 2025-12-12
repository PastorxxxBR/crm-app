import { NextRequest, NextResponse } from 'next/server'
import { GoogleMasterAgent } from '@/agents/google-master'

export async function POST(request: NextRequest) {
    try {
        const { query, maxResults, category } = await request.json()

        if (!query) {
            return NextResponse.json(
                { error: 'Query é obrigatório' },
                { status: 400 }
            )
        }

        const agent = new GoogleMasterAgent()

        // Buscar produtos
        const products = await agent.searchProducts({
            query,
            maxResults: maxResults || 10,
            category
        })

        // Analisar com IA
        const analysis = await agent.analyzeProductsWithAI(query)

        return NextResponse.json({
            success: true,
            query,
            products,
            analysis,
            totalResults: products.length
        })
    } catch (error: any) {
        console.error('Erro ao buscar produtos:', error)
        return NextResponse.json(
            { error: error.message || 'Erro ao buscar produtos' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query') || searchParams.get('q')

    if (!query) {
        return NextResponse.json(
            { error: 'Parâmetro query ou q é obrigatório' },
            { status: 400 }
        )
    }

    try {
        const agent = new GoogleMasterAgent()
        const products = await agent.searchProducts({ query })

        return NextResponse.json({
            success: true,
            query,
            products,
            totalResults: products.length
        })
    } catch (error: any) {
        console.error('Erro ao buscar produtos:', error)
        return NextResponse.json(
            { error: error.message || 'Erro ao buscar produtos' },
            { status: 500 }
        )
    }
}
