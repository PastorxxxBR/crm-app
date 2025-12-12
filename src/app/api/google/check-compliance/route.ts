import { NextRequest, NextResponse } from 'next/server'
import { GoogleMasterAgent } from '@/agents/google-master'

export async function POST(request: NextRequest) {
    try {
        const productData = await request.json()

        const agent = new GoogleMasterAgent()
        const compliance = await agent.checkGoogleShoppingCompliance(productData)

        return NextResponse.json({
            success: true,
            compliance
        })
    } catch (error: any) {
        console.error('Erro ao verificar conformidade:', error)
        return NextResponse.json(
            { error: error.message || 'Erro ao verificar conformidade' },
            { status: 500 }
        )
    }
}
