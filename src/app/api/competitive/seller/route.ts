import { NextRequest, NextResponse } from 'next/server'
import { getSellerDetails } from '@/lib/realMLScraper'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const sellerId = searchParams.get('sellerId')

        if (!sellerId) {
            return NextResponse.json(
                { error: 'Seller ID é obrigatório' },
                { status: 400 }
            )
        }

        console.log(`👤 Buscando vendedor: ${sellerId}`)

        const sellerInfo = await getSellerDetails(parseInt(sellerId))

        if (!sellerInfo) {
            return NextResponse.json(
                { error: 'Vendedor não encontrado' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            seller: sellerInfo,
            timestamp: new Date().toISOString()
        })
    } catch (error: any) {
        console.error('❌ Erro:', error)
        return NextResponse.json(
            { error: error.message || 'Erro ao buscar vendedor' },
            { status: 500 }
        )
    }
}
