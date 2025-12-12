import { NextRequest, NextResponse } from 'next/server'
import { GoogleMasterAgent } from '@/agents/google-master'

export async function POST(request: NextRequest) {
    try {
        const { address } = await request.json()

        if (!address) {
            return NextResponse.json(
                { error: 'Endereço é obrigatório' },
                { status: 400 }
            )
        }

        const agent = new GoogleMasterAgent()
        const location = await agent.geocodeAddress(address)

        if (!location) {
            return NextResponse.json(
                { error: 'Endereço não encontrado' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            location
        })
    } catch (error: any) {
        console.error('Erro ao geocodificar:', error)
        return NextResponse.json(
            { error: error.message || 'Erro ao geocodificar endereço' },
            { status: 500 }
        )
    }
}
