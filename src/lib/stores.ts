/**
 * Sistema de Gestão Multi-Lojas
 * Gerencia múltiplas lojas com inventário e vendas separados
 */

import { z } from 'zod'

// ============= LOJAS =============

export const StoreSchema = z.object({
    id: z.string(),
    name: z.string().min(1, 'Nome obrigatório'),
    slug: z.string().min(1), // Para subdomínio
    address: z.string(),
    city: z.string(),
    state: z.string(),
    phone: z.string(),
    email: z.string().email().optional(),
    manager_name: z.string().optional(),
    opening_hours: z.string().optional(),
    status: z.enum(['active', 'inactive']).default('active'),
    created_at: z.date().optional(),
    updated_at: z.date().optional(),
})

export type Store = z.infer<typeof StoreSchema>

// Mock de lojas (depois será banco de dados)
let stores: Store[] = [
    {
        id: 'store_1',
        name: 'Loja Centro',
        slug: 'centro',
        address: 'Rua Principal, 123',
        city: 'São Sebastião',
        state: 'SP',
        phone: '(12) 99205-8243',
        manager_name: 'Maria Silva',
        opening_hours: 'Seg-Sex: 9h-18h, Sáb: 9h-14h',
        status: 'active',
        created_at: new Date(),
    },
    {
        id: 'store_2',
        name: 'Loja Shopping',
        slug: 'shopping',
        address: 'Shopping Center, Loja 45',
        city: 'São Sebastião',
        state: 'SP',
        phone: '(12) 99205-8244',
        manager_name: 'João Santos',
        opening_hours: 'Seg-Dom: 10h-22h',
        status: 'active',
        created_at: new Date(),
    },
    {
        id: 'store_3',
        name: 'Loja Bairro',
        slug: 'bairro',
        address: 'Av. das Flores, 456',
        city: 'São Sebastião',
        state: 'SP',
        phone: '(12) 99205-8245',
        manager_name: 'Ana Costa',
        opening_hours: 'Seg-Sex: 9h-18h',
        status: 'active',
        created_at: new Date(),
    },
]

// ============= CRUD DE LOJAS =============

export function getAllStores(): Store[] {
    return stores.filter(s => s.status === 'active')
}

export function getStoreById(id: string): Store | undefined {
    return stores.find(s => s.id === id)
}

export function getStoreBySlug(slug: string): Store | undefined {
    return stores.find(s => s.slug === slug)
}

export function createStore(data: Omit<Store, 'id' | 'created_at'>): Store {
    const newStore: Store = {
        ...data,
        id: `store_${Date.now()}`,
        created_at: new Date(),
    }

    stores.push(newStore)
    return newStore
}

export function updateStore(id: string, data: Partial<Store>): Store | null {
    const index = stores.findIndex(s => s.id === id)

    if (index === -1) return null

    stores[index] = {
        ...stores[index],
        ...data,
        updated_at: new Date(),
    }

    return stores[index]
}

export function deleteStore(id: string): boolean {
    const index = stores.findIndex(s => s.id === id)

    if (index === -1) return false

    // Soft delete
    stores[index].status = 'inactive'
    stores[index].updated_at = new Date()

    return true
}

// ============= ESTATÍSTICAS POR LOJA =============

export interface StoreStats {
    store: Store
    total_sales: number
    sales_today: number
    sales_this_month: number
    total_products: number
    low_stock_items: number
    active_employees: number
}

export function getStoreStats(storeId: string): StoreStats | null {
    const store = getStoreById(storeId)
    if (!store) return null

    // Mock de estatísticas (depois virá do banco)
    return {
        store,
        total_sales: 150000,
        sales_today: 2500,
        sales_this_month: 45000,
        total_products: 250,
        low_stock_items: 12,
        active_employees: 5,
    }
}

// ============= VALIDAÇÕES =============

export function validateStoreSlug(slug: string, excludeId?: string): boolean {
    const existing = stores.find(s =>
        s.slug === slug &&
        s.id !== excludeId &&
        s.status === 'active'
    )

    return !existing
}

export function generateStoreSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

// ============= SUBDOMÍNIOS =============

export function getStoreFromSubdomain(hostname: string): Store | null {
    // Extrair subdomínio
    // Ex: loja1.tocadaoncaroupa.com -> loja1
    const parts = hostname.split('.')

    if (parts.length < 3) return null

    const subdomain = parts[0]

    // Mapear subdomínio para slug
    const slugMap: Record<string, string> = {
        'loja1': 'centro',
        'loja2': 'shopping',
        'loja3': 'bairro',
    }

    const slug = slugMap[subdomain]
    if (!slug) return null

    return getStoreBySlug(slug)
}
