import { NextRequest, NextResponse } from 'next/server'
import { getTikTokService } from '@/lib/tiktok'

export async function GET(request: NextRequest) {
    try {
        const tiktok = getTikTokService()

        const searchParams = request.nextUrl.searchParams
        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('pageSize') || '20')

        const products = await tiktok.listProducts(page, pageSize)

        return NextResponse.json({
            success: true,
            products,
            page,
            pageSize
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const tiktok = getTikTokService()
        const product = await request.json()

        const result = await tiktok.createProduct(product)

        return NextResponse.json({
            success: true,
            product: result
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
