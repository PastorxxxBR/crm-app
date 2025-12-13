import { NextRequest, NextResponse } from 'next/server'
import { getStoreStats } from '@/lib/stores'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const storeId = searchParams.get('store_id')

        if (!storeId) {
            return NextResponse.json(
                { success: false, error: 'store_id obrigatório' },
                { status: 400 }
            )
        }

        const stats = getStoreStats(storeId)

        if (!stats) {
            return NextResponse.json(
                { success: false, error: 'Loja não encontrada' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, stats })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
