// Tipos para gerenciamento de produtos nos marketplaces

export interface MarketplaceProduct {
    id: string
    productId: string // ID do produto no seu sistema
    marketplaceId: string
    externalId?: string // ID no marketplace
    sku: string
    name: string
    category: 'masculino' | 'feminino' | 'infantil'
    costPrice: number // Preço de custo
    sellingPrice: number // Preço de venda no marketplace
    stock: number
    active: boolean
    url?: string
    lastSync?: Date
    createdAt: Date
    updatedAt: Date
}

export interface ProductPerformance {
    productId: string
    marketplaceId: string
    views: number
    sales: number
    revenue: number
    conversionRate: number
    lastSale?: Date
}

export interface PriceRecommendation {
    currentPrice: number
    recommendedPrice: number
    reason: string
    competitorAvg: number
    potentialProfit: number
}
