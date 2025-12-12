import { NextRequest, NextResponse } from 'next/server'
import { getPaymentFeeManager, PaymentFeeConfigSchema } from '@/lib/payment-fees'

/**
 * GET - Listar configurações de taxas
 */
export async function GET(request: NextRequest) {
    try {
        const feeManager = getPaymentFeeManager()
        const configs = feeManager.getAllConfigs()

        return NextResponse.json({
            success: true,
            configs
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}

/**
 * POST - Adicionar/Atualizar configuração
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validar
        const config = PaymentFeeConfigSchema.parse(body)

        // Adicionar
        const feeManager = getPaymentFeeManager()
        feeManager.addConfig(config)

        return NextResponse.json({
            success: true,
            config
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        )
    }
}

/**
 * DELETE - Remover configuração
 */
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const payment_method = searchParams.get('payment_method') as any
        const card_brand = searchParams.get('card_brand') as any

        const feeManager = getPaymentFeeManager()
        feeManager.removeConfig(payment_method, card_brand)

        return NextResponse.json({
            success: true
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        )
    }
}
