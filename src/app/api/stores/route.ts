import { NextRequest, NextResponse } from 'next/server'
import { getAllStores, getStoreById, createStore, updateStore, deleteStore, StoreSchema } from '@/lib/stores'

// GET - Listar todas as lojas
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const id = searchParams.get('id')

        if (id) {
            const store = getStoreById(id)
            if (!store) {
                return NextResponse.json(
                    { success: false, error: 'Loja não encontrada' },
                    { status: 404 }
                )
            }
            return NextResponse.json({ success: true, store })
        }

        const stores = getAllStores()
        return NextResponse.json({ success: true, stores })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}

// POST - Criar nova loja
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const validated = StoreSchema.omit({ id: true, created_at: true }).parse(body)

        const newStore = createStore(validated)

        return NextResponse.json({
            success: true,
            store: newStore,
            message: 'Loja criada com sucesso!'
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        )
    }
}

// PUT - Atualizar loja
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, ...data } = body

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID obrigatório' },
                { status: 400 }
            )
        }

        const updated = updateStore(id, data)

        if (!updated) {
            return NextResponse.json(
                { success: false, error: 'Loja não encontrada' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            store: updated,
            message: 'Loja atualizada!'
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        )
    }
}

// DELETE - Deletar loja
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID obrigatório' },
                { status: 400 }
            )
        }

        const deleted = deleteStore(id)

        if (!deleted) {
            return NextResponse.json(
                { success: false, error: 'Loja não encontrada' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Loja removida!'
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
