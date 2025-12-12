import { NextResponse } from 'next/server'
import { mercadoLivreService } from '@/lib/mercadoLivre'

export async function GET() {
    try {
        const connection = await mercadoLivreService.checkConnection()

        return NextResponse.json({
            success: connection.connected,
            ...connection,
            timestamp: new Date().toISOString()
        })
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                connected: false,
                error: error.message
            },
            { status: 500 }
        )
    }
}
