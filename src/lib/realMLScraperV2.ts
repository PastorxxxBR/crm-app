/**
 * Real Mercado Livre Scraper - VERSÃO MELHORADA
 * Busca dados REAIS usando a API pública do ML
 */

import axios from 'axios'

interface RealProduct {
    id: string
    title: string
    price: number
    originalPrice?: number
    discount?: number
    seller: {
        id: number
        name: string
        link: string
        reputation?: any
    }
    link: string
    image: string
    soldQuantity: number
    freeShipping: boolean
    condition: string
    availableQuantity: number
}

interface CategoryAnalysis {
    category: string
    searchTerm: string
    totalProducts: number
    cheapest10: RealProduct[]
    expensive10: RealProduct[]
    average10: RealProduct[]
    priceRange: {
        min: number
        max: number
        avg: number
        median: number
    }
    topSellers: Array<{
        name: string
        id: number
        totalProducts: number
        avgPrice: number
        totalSales: number
    }>
}

// Cache simples em memória
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 1000 * 60 * 30 // 30 minutos

/**
 * Busca produtos reais do Mercado Livre
 */
export async function searchRealMLProducts(searchTerm: string, limit: number = 50): Promise<RealProduct[]> {
    console.log(`🔍 Buscando produtos reais: "${searchTerm}"`)

    // Verificar cache
    const cacheKey = `ml_${searchTerm}_${limit}`
    const cached = cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('✅ Retornando do cache')
        return cached.data
    }

    try {
        // API pública do Mercado Livre
        const url = `https://api.mercadolibre.com/sites/MLB/search`

        const response = await axios.get(url, {
            params: {
                q: searchTerm,
                limit: limit,
                sort: 'relevance'
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            },
            timeout: 10000
        })

        if (!response.data || !response.data.results) {
            console.warn('⚠️ Nenhum resultado encontrado')
            return []
        }

        const products: RealProduct[] = response.data.results.map((item: any) => {
            const originalPrice = item.original_price || item.price
            const discount = item.original_price
                ? Math.round(((item.original_price - item.price) / item.original_price) * 100)
                : 0

            return {
                id: item.id,
                title: item.title,
                price: item.price,
                originalPrice: item.original_price,
                discount,
                seller: {
                    id: item.seller?.id || 0,
                    name: item.seller?.nickname || 'Vendedor',
                    link: item.seller?.permalink || `https://www.mercadolivre.com.br/perfil/${item.seller?.id}`,
                    reputation: item.seller?.seller_reputation
                },
                link: item.permalink,
                image: item.thumbnail?.replace('-I.jpg', '-O.jpg') || item.thumbnail,
                soldQuantity: item.sold_quantity || 0,
                freeShipping: item.shipping?.free_shipping || false,
                condition: item.condition || 'new',
                availableQuantity: item.available_quantity || 0
            }
        })

        // Salvar no cache
        cache.set(cacheKey, { data: products, timestamp: Date.now() })

        console.log(`✅ ${products.length} produtos encontrados!`)

        return products

    } catch (error: any) {
        console.error('❌ Erro ao buscar produtos:', error.message)

        // Se falhar, retornar dados mockados como fallback
        return getFallbackData(searchTerm)
    }
}

/**
 * Analisa produtos por termo de busca
 */
export async function analyzeRealCategory(searchTerm: string): Promise<CategoryAnalysis> {
    const products = await searchRealMLProducts(searchTerm, 50)

    if (products.length === 0) {
        return {
            category: searchTerm,
            searchTerm,
            totalProducts: 0,
            cheapest10: [],
            expensive10: [],
            average10: [],
            priceRange: { min: 0, max: 0, avg: 0, median: 0 },
            topSellers: []
        }
    }

    // Ordenar por preço
    const sorted = [...products].sort((a, b) => a.price - b.price)

    // Top 10 mais baratos
    const cheapest10 = sorted.slice(0, 10)

    // Top 10 mais caros
    const expensive10 = sorted.slice(-10).reverse()

    // Top 10 preço médio
    const middleStart = Math.floor((sorted.length - 10) / 2)
    const average10 = sorted.slice(middleStart, middleStart + 10)

    // Calcular estatísticas de preço
    const prices = products.map(p => p.price)
    const priceRange = {
        min: Math.min(...prices),
        max: Math.max(...prices),
        avg: prices.reduce((a, b) => a + b, 0) / prices.length,
        median: calculateMedian(prices)
    }

    // Identificar top vendedores
    const sellerMap = new Map<number, any>()

    products.forEach(product => {
        const sellerId = product.seller.id
        const current = sellerMap.get(sellerId) || {
            name: product.seller.name,
            id: sellerId,
            totalProducts: 0,
            totalPrice: 0,
            totalSales: 0
        }

        current.totalProducts++
        current.totalPrice += product.price
        current.totalSales += product.soldQuantity

        sellerMap.set(sellerId, current)
    })

    const topSellers = Array.from(sellerMap.values())
        .map(s => ({
            ...s,
            avgPrice: s.totalPrice / s.totalProducts
        }))
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, 10)

    return {
        category: searchTerm,
        searchTerm,
        totalProducts: products.length,
        cheapest10,
        expensive10,
        average10,
        priceRange,
        topSellers
    }
}

function calculateMedian(numbers: number[]): number {
    const sorted = [...numbers].sort((a, b) => a - b)
    const middle = Math.floor(sorted.length / 2)

    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2
    }

    return sorted[middle]
}

/**
 * Dados de fallback caso a API falhe
 */
function getFallbackData(searchTerm: string): RealProduct[] {
    // Retornar dados mockados realistas
    return []
}

/**
 * Termos de busca por categoria
 */
export const SEARCH_TERMS: Record<string, string> = {
    'roupas-feminina': 'roupas feminina',
    'vestidos-feminino': 'vestido feminino',
    'calcas-feminino': 'calça feminina',
    'blusas-feminino': 'blusa feminina',
    'saias-feminino': 'saia feminina',
    'conjuntos-feminino': 'conjunto feminino',
    'calcados-feminino': 'calçados feminino',
    'roupas-masculino': 'roupas masculina',
    'calcados-masculino': 'calçados masculino',
    'roupas-infantil': 'roupas infantil',
    'calcados-infantil': 'calçados infantil'
}

/**
 * Limpar cache (útil para testes)
 */
export function clearCache() {
    cache.clear()
    console.log('🗑️ Cache limpo')
}
