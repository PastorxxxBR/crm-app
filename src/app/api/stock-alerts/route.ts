import { NextRequest, NextResponse } from 'next/server'
import { getAllAlerts, getActiveAlerts, resolveAlert, getAlertStats } from '@/lib/stock-alerts'

// GET - Listar alertas
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const storeId = searchParams.get('store_id')
        const activeOnly = searchParams.get('active_only') === 'true'
        const stats = searchParams.get('stats') === 'true'

        if (stats) {
            const alertStats = getAlertStats(storeId || undefined)
            return NextResponse.json({ success: true, stats: alertStats })
        }

        const alerts = activeOnly
            ? getActiveAlerts(storeId || undefined)
            : getAllAlerts(storeId || undefined)

        return NextResponse.json({ success: true, alerts })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}

// POST - Resolver alerta
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { alert_id } = body

        if (!alert_id) {
            return NextResponse.json(
                { success: false, error: 'alert_id obrigatório' },
                { status: 400 }
            )
        }

        const resolved = resolveAlert(alert_id)

        if (!resolved) {
            return NextResponse.json(
                { success: false, error: 'Alerta não encontrado' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Alerta resolvido!'
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
