import { NextRequest, NextResponse } from 'next/server'
import { SaleSchema } from '@/lib/types/pos'

// Mock de armazenamento (depois será banco de dados)
const sales: any[] = []

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validar venda
        const sale = SaleSchema.parse({
            ...body,
            id: crypto.randomUUID(),
            created_at: new Date(),
        })

        // Salvar venda (mock)
        sales.push(sale)

        // TODO: Atualizar estoque
        // TODO: Registrar no caixa
        // TODO: Criar conta a receber (se parcelado)

        return NextResponse.json({
            success: true,
            sale,
            message: 'Venda registrada com sucesso!'
        })
    } catch (error: any) {
        console.error('Erro ao processar venda:', error)

        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Erro ao processar venda'
            },
            { status: 400 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const cashRegisterId = searchParams.get('cash_register_id')

        let filteredSales = sales

        if (cashRegisterId) {
            filteredSales = sales.filter(s => s.cash_register_id === cashRegisterId)
        }

        return NextResponse.json({
            success: true,
            sales: filteredSales,
            total: filteredSales.reduce((sum, s) => sum + s.total_amount, 0)
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
