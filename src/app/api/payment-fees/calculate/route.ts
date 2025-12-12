import { NextRequest, NextResponse } from 'next/server'
import { getPaymentFeeManager, FeeCalculationSchema } from '@/lib/payment-fees'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validar request
        const calculation = FeeCalculationSchema.parse(body)

        // Calcular taxa
        const feeManager = getPaymentFeeManager()
        const result = feeManager.calculateFee(calculation)

        return NextResponse.json({
            success: true,
            calculation: result
        })
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                error: error.message
            },
            { status: 400 }
        )
    }
}
