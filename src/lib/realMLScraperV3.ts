/**
 * Mercado Livre Scraper V3 - MELHORADO
 * Com retry, circuit breaker e validação
 */

import axios from 'axios'
import { withRetry, CircuitBreaker } from '../utils/retry'
import { MLProduct, CategoryAnalysis, MLProductSchema, CategoryAnalysisSchema } from '../validation/schemas'
import globalCache from '../cache'

// Circuit breaker para ML API
const mlCircuitBreaker = new CircuitBreaker(5, 60000)

// User agents para rotação
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
]

function getRandomUserAgent(): string {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

function getRandomDelay(): number {
    return Math.floor(Math.random() * 1000) + 500 // 500-1500ms
}

/**
 * Buscar produtos reais do ML com retry e validação
 */
export async function searchRealMLProducts(
    searchTerm: string,
    limit: number = 50
): Promise<MLProduct[]> {
    const cacheKey = `ml_products_${searchTerm}_${limit}`

    // Tentar cache primeiro
    const cached = globalCache.get<MLProduct[]>(cacheKey)
    if (cached) {
        console.log('✅ Retornando do cache:', searchTerm)
        return cached
    }

    console.log(`🔍 Buscando produtos ML: "${searchTerm}"`)

    try {
        // Usar circuit breaker
        const products = await mlCircuitBreaker.execute(async () => {
            // Retry automático
            return await withRetry(
                async () => {
                    // Delay aleatório para evitar rate limit
                    await new Promise(resolve => setTimeout(resolve, getRandomDelay()))

                    const response = await axios.get(
                        'https://api.mercadolibre.com/sites/MLB/search',
                        {
                            params: {
                                q: searchTerm,
                                limit,
                                sort: 'relevance'
                            },
                            headers: {
                                'User-Agent': getRandomUserAgent(),
                                'Accept': 'application/json',
                                'Accept-Language': 'pt-BR,pt;q=0.9',
                            },
                            timeout: 10000
                        }
                    )

                    if (!response.data?.results) {
                        throw new Error('Resposta inválida da API ML')
                    }

                    // Mapear e validar produtos
                    const products: MLProduct[] = response.data.results.map((item: any) => {
                        const product = {
                            id: item.id,
                            title: item.title,
                            price: item.price,
                            originalPrice: item.original_price,
                            discount: item.original_price
                                ? Math.round(((item.original_price - item.price) / item.original_price) * 100)
                                : 0,
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
                            condition: item.condition === 'used' ? 'used' : 'new',
                            availableQuantity: item.available_quantity || 0
                        }

                        // Validar com Zod
                        return MLProductSchema.parse(product)
                    })

                    return products
                },
                {
                    maxRetries: 3,
                    initialDelay: 1000,
                    shouldRetry: (error) => {
                        // Retry em erros de rede ou 429 (rate limit)
                        return !error.response ||
                            error.response.status === 429 ||
                            error.response.status >= 500
                    }
                }
            )
        })

        // Salvar no cache (30 minutos)
        globalCache.set(cacheKey, products, 1000 * 60 * 30)

        console.log(`✅ ${products.length} produtos encontrados!`)
        return products

    } catch (error: any) {
        console.error('❌ Erro ao buscar produtos ML:', error.message)

        // Retornar dados mockados como fallback
        return getFallbackData(searchTerm)
    }
}

/**
 * Analisar categoria com validação
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

    // Calcular estatísticas
    const prices = products.map(p => p.price)
    const priceRange = {
        min: Math.min(...prices),
        max: Math.max(...prices),
        avg: prices.reduce((a, b) => a + b, 0) / prices.length,
        median: calculateMedian(prices)
    }

    // Top vendedores
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

    const analysis: CategoryAnalysis = {
        category: searchTerm,
        searchTerm,
        totalProducts: products.length,
        cheapest10,
        expensive10,
        average10,
        priceRange,
        topSellers
    }

    // Validar resultado
    return CategoryAnalysisSchema.parse(analysis)
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
 * Dados de fallback
 */
function getFallbackData(searchTerm: string): MLProduct[] {
    console.log('⚠️ Usando dados mockados para:', searchTerm)
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
 * Limpar cache
 */
export function clearMLCache() {
    globalCache.invalidatePattern('ml_')
    console.log('🗑️ Cache ML limpo')
}
