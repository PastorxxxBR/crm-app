/**
 * Sistema de Gestão de Funcionários
 * Login com PIN e controle de acesso
 */

import { z } from 'zod'

// ============= FUNCIONÁRIOS =============

export const EmployeeRoleSchema = z.enum(['admin', 'manager', 'cashier'])

export type EmployeeRole = z.infer<typeof EmployeeRoleSchema>

export const EmployeeSchema = z.object({
    id: z.string(),
    name: z.string().min(1, 'Nome obrigatório'),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    role: EmployeeRoleSchema,
    store_id: z.string(),
    pin: z.string().length(4, 'PIN deve ter 4 dígitos'),
    status: z.enum(['active', 'inactive']).default('active'),
    created_at: z.date().optional(),
    updated_at: z.date().optional(),
})

export type Employee = z.infer<typeof EmployeeSchema>

// Mock de funcionários
let employees: Employee[] = [
    {
        id: 'emp_1',
        name: 'Maria Silva',
        email: 'maria@tocadaonca.com',
        phone: '(12) 99999-0001',
        role: 'manager',
        store_id: 'store_1',
        pin: '1234',
        status: 'active',
        created_at: new Date(),
    },
    {
        id: 'emp_2',
        name: 'João Santos',
        email: 'joao@tocadaonca.com',
        phone: '(12) 99999-0002',
        role: 'manager',
        store_id: 'store_2',
        pin: '2345',
        status: 'active',
        created_at: new Date(),
    },
    {
        id: 'emp_3',
        name: 'Ana Costa',
        email: 'ana@tocadaonca.com',
        phone: '(12) 99999-0003',
        role: 'manager',
        store_id: 'store_3',
        pin: '3456',
        status: 'active',
        created_at: new Date(),
    },
    {
        id: 'emp_4',
        name: 'Carlos Oliveira',
        role: 'cashier',
        store_id: 'store_1',
        pin: '4567',
        status: 'active',
        created_at: new Date(),
    },
    {
        id: 'emp_5',
        name: 'Paula Souza',
        role: 'cashier',
        store_id: 'store_2',
        pin: '5678',
        status: 'active',
        created_at: new Date(),
    },
]

// ============= CRUD DE FUNCIONÁRIOS =============

export function getAllEmployees(storeId?: string): Employee[] {
    let filtered = employees.filter(e => e.status === 'active')

    if (storeId) {
        filtered = filtered.filter(e => e.store_id === storeId)
    }

    return filtered
}

export function getEmployeeById(id: string): Employee | undefined {
    return employees.find(e => e.id === id)
}

export function createEmployee(data: Omit<Employee, 'id' | 'created_at'>): Employee {
    const newEmployee: Employee = {
        ...data,
        id: `emp_${Date.now()}`,
        created_at: new Date(),
    }

    employees.push(newEmployee)
    return newEmployee
}

export function updateEmployee(id: string, data: Partial<Employee>): Employee | null {
    const index = employees.findIndex(e => e.id === id)

    if (index === -1) return null

    employees[index] = {
        ...employees[index],
        ...data,
        updated_at: new Date(),
    }

    return employees[index]
}

export function deleteEmployee(id: string): boolean {
    const index = employees.findIndex(e => e.id === id)

    if (index === -1) return false

    employees[index].status = 'inactive'
    employees[index].updated_at = new Date()

    return true
}

// ============= AUTENTICAÇÃO =============

export interface LoginResult {
    success: boolean
    employee?: Employee
    error?: string
}

export function loginWithPIN(pin: string, storeId?: string): LoginResult {
    const employee = employees.find(e =>
        e.pin === pin &&
        e.status === 'active' &&
        (!storeId || e.store_id === storeId)
    )

    if (!employee) {
        return {
            success: false,
            error: 'PIN inválido ou funcionário não encontrado'
        }
    }

    return {
        success: true,
        employee: {
            ...employee,
            pin: '****' // Não retornar PIN
        }
    }
}

// ============= PERMISSÕES =============

export interface Permissions {
    can_open_register: boolean
    can_close_register: boolean
    can_manage_employees: boolean
    can_manage_products: boolean
    can_view_reports: boolean
    can_manage_stores: boolean
    can_delete_sales: boolean
}

export function getPermissions(role: EmployeeRole): Permissions {
    switch (role) {
        case 'admin':
            return {
                can_open_register: true,
                can_close_register: true,
                can_manage_employees: true,
                can_manage_products: true,
                can_view_reports: true,
                can_manage_stores: true,
                can_delete_sales: true,
            }

        case 'manager':
            return {
                can_open_register: true,
                can_close_register: true,
                can_manage_employees: false,
                can_manage_products: true,
                can_view_reports: true,
                can_manage_stores: false,
                can_delete_sales: false,
            }

        case 'cashier':
            return {
                can_open_register: true,
                can_close_register: true,
                can_manage_employees: false,
                can_manage_products: false,
                can_view_reports: false,
                can_manage_stores: false,
                can_delete_sales: false,
            }
    }
}

// ============= VALIDAÇÕES =============

export function validatePIN(pin: string): boolean {
    return /^\d{4}$/.test(pin)
}

export function generateRandomPIN(): string {
    return Math.floor(1000 + Math.random() * 9000).toString()
}
