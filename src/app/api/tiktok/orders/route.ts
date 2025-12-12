import { NextRequest, NextResponse } from 'next/server'
import { getTikTokService } from '@/lib/tiktok'

export async function GET(request: NextRequest) {
    try {
        const tiktok = getTikTokService()

        const searchParams = request.nextUrl.searchParams
        const status = searchParams.get('status') || undefined

        const orders = await tiktok.listOrders(status)

        return NextResponse.json({
            success: true,
            orders
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
