import { NextResponse } from 'next/server'
import { carouselCreator } from '@/lib/carouselCreator'

export async function POST(request: Request) {
    try {
        const { products } = await request.json()

        const carousel = await carouselCreator.generateCarousel(products)

        return NextResponse.json({ success: true, carousel })
    } catch (error) {
        return NextResponse.json({ error: 'Erro' }, { status: 500 })
    }
}
