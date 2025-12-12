/**
 * Tipos e Schemas para Sistema PDV/Caixa
 */

import { z } from 'zod'

// ============= LOJAS =============

export const StoreSchema = z.object({
    id: z.string(),
    name: z.string().min(1),
    address: z.string(),
    phone: z.string(),
    email: z.string().email().optional(),
    opening_hours: z.string().optional(),
    status: z.enum(['active', 'inactive']).default('active'),
    created_at: z.date().optional(),
})

export type Store = z.infer<typeof StoreSchema>

// ============= FUNCIONÁRIOS =============

export const EmployeeSchema = z.object({
    id: z.string(),
    name: z.string().min(1),
    email: z.string().email(),
    role: z.enum(['admin', 'manager', 'cashier']),
    store_id: z.string(),
    pin: z.string().length(4).optional(), // PIN para login rápido
    status: z.enum(['active', 'inactive']).default('active'),
    created_at: z.date().optional(),
})

export type Employee = z.infer<typeof EmployeeSchema>

// ============= CAIXA =============

export const CashRegisterSchema = z.object({
    id: z.string(),
    store_id: z.string(),
    employee_id: z.string(),
    opening_date: z.date(),
    opening_amount: z.number().nonnegative(),
    closing_date: z.date().optional(),
    closing_amount: z.number().nonnegative().optional(),
    expected_amount: z.number().nonnegative().optional(),
    difference: z.number().optional(),
    status: z.enum(['open', 'closed']).default('open'),
    notes: z.string().optional(),
})

export type CashRegister = z.infer<typeof CashRegisterSchema>

// ============= VENDAS =============

export const SaleItemSchema = z.object({
    product_id: z.string(),
    product_name: z.string(),
    quantity: z.number().int().positive(),
    unit_price: z.number().positive(),
    subtotal: z.number().positive(),
})

export const SaleSchema = z.object({
    id: z.string().optional(),
    store_id: z.string(),
    employee_id: z.string(),
    cash_register_id: z.string(),
    customer_id: z.string().optional(),
    customer_name: z.string().optional(),

    // Itens
    items: z.array(SaleItemSchema).min(1),

    // Valores
    subtotal: z.number().positive(),
    discount: z.number().nonnegative().default(0),
    total_amount: z.number().positive(),

    // Pagamento
    payment_method: z.enum(['credit', 'debit', 'pix', 'cash']),
    card_brand: z.string().optional(),
    installments: z.number().int().min(1).max(12).default(1),

    // Taxas
    payment_fee: z.number().nonnegative().default(0),
    net_amount: z.number().positive(),

    // Metadata
    status: z.enum(['completed', 'cancelled']).default('completed'),
    created_at: z.date().optional(),
    notes: z.string().optional(),
})

export type Sale = z.infer<typeof SaleSchema>
export type SaleItem = z.infer<typeof SaleItemSchema>

// ============= MOVIMENTAÇÕES DE CAIXA =============

export const CashMovementSchema = z.object({
    id: z.string().optional(),
    cash_register_id: z.string(),
    type: z.enum(['withdrawal', 'deposit']), // sangria ou reforço
    amount: z.number().positive(),
    reason: z.string(),
    employee_id: z.string(),
    created_at: z.date().optional(),
})

export type CashMovement = z.infer<typeof CashMovementSchema>

// ============= PRODUTOS (simplificado para PDV) =============

export interface Product {
    id: string
    name: string
    price: number
    stock: number
    barcode?: string
    image?: string
    category?: string
}

// ============= RESUMO DE CAIXA =============

export interface CashRegisterSummary {
    cash_register: CashRegister
    employee: Employee
    store: Store

    // Vendas
    total_sales: number
    sales_count: number
    sales_amount: number

    // Movimentações
    withdrawals: number
    deposits: number

    // Calculado
    expected_amount: number
    actual_amount?: number
    difference?: number

    // Detalhes de pagamento
    payment_breakdown: {
        pix: number
        cash: number
        debit: number
        credit: number
    }
}
