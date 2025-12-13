import { NextRequest, NextResponse } from 'next/server'
import { loginWithPIN, getPermissions } from '@/lib/employees'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { pin, store_id } = body

        if (!pin) {
            return NextResponse.json(
                { success: false, error: 'PIN obrigatório' },
                { status: 400 }
            )
        }

        const result = loginWithPIN(pin, store_id)

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 401 }
            )
        }

        const permissions = getPermissions(result.employee!.role)

        return NextResponse.json({
            success: true,
            employee: result.employee,
            permissions,
            message: `Bem-vindo(a), ${result.employee!.name}!`
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
