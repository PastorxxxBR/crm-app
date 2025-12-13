import { NextRequest, NextResponse } from 'next/server'
import { getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, EmployeeSchema } from '@/lib/employees'

// GET - Listar funcionários
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const id = searchParams.get('id')
        const storeId = searchParams.get('store_id')

        if (id) {
            const employee = getEmployeeById(id)
            if (!employee) {
                return NextResponse.json(
                    { success: false, error: 'Funcionário não encontrado' },
                    { status: 404 }
                )
            }
            return NextResponse.json({ success: true, employee: { ...employee, pin: '****' } })
        }

        const employees = getAllEmployees(storeId || undefined)
        return NextResponse.json({
            success: true,
            employees: employees.map(e => ({ ...e, pin: '****' }))
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}

// POST - Criar funcionário
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const validated = EmployeeSchema.omit({ id: true, created_at: true }).parse(body)

        const newEmployee = createEmployee(validated)

        return NextResponse.json({
            success: true,
            employee: { ...newEmployee, pin: '****' },
            message: 'Funcionário criado!'
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        )
    }
}

// PUT - Atualizar funcionário
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

        const updated = updateEmployee(id, data)

        if (!updated) {
            return NextResponse.json(
                { success: false, error: 'Funcionário não encontrado' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            employee: { ...updated, pin: '****' },
            message: 'Funcionário atualizado!'
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        )
    }
}

// DELETE - Deletar funcionário
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

        const deleted = deleteEmployee(id)

        if (!deleted) {
            return NextResponse.json(
                { success: false, error: 'Funcionário não encontrado' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Funcionário removido!'
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
