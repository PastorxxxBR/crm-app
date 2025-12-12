import { NextResponse } from 'next/server'
import { mercadoLivreService } from '@/lib/mercadoLivre'

export async function GET() {
    try {
        const stats = await mercadoLivreService.getStats()

        return NextResponse.json({
            success: true,
            marketplace: 'Mercado Livre',
            stats,
            timestamp: new Date().toISOString()
        })
    } catch (error: any) {
        console.error('Erro ao buscar estatísticas:', error)
        return NextResponse.json(
            { error: error.message || 'Erro ao buscar estatísticas' },
            { status: 500 }
        )
    }
}
