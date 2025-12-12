import { NextResponse } from 'next/server'
import { mlTokenManager } from '@/lib/mlTokenManager'

export async function GET() {
    try {
        const status = mlTokenManager.getTokenStatus()

        return NextResponse.json({
            success: true,
            ...status,
            timestamp: new Date().toISOString()
        })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}

export async function POST() {
    try {
        const renewed = await mlTokenManager.renewToken()

        return NextResponse.json({
            success: renewed,
            message: renewed ? 'Token renovado com sucesso!' : 'Erro ao renovar token',
            status: mlTokenManager.getTokenStatus(),
            timestamp: new Date().toISOString()
        })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
