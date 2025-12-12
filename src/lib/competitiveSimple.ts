/**
 * Competitive Intelligence Agent - VERSÃO CORRIGIDA
 * 
 * Busca dados REAIS do Mercado Livre usando API PÚBLICA
 * Não precisa de autenticação!
 */

interface CompetitorProduct {
    id: string
    title: string
    price: number
    seller: {
        id: number
        nickname: string
    }
    permalink: string
    thumbnail: string
    sold_quantity: number
    available_quantity: number
}

interface CategoryAnalysis {
    category: string
    totalProducts: number
    cheapest10: CompetitorProduct[]
    expensive10: CompetitorProduct[]
    average10: CompetitorProduct[]
    priceRange: {
        min: number
        max: number
        avg: number
        median: number
    }
    topSellers: Array<{
        seller: string
        sellerId: number
        totalProducts: number
        avgPrice: number
        totalSales: number
    }>
}

// Categorias do Mercado Livre
const CATEGORIES: Record<string, string> = {
    'vestidos-feminino': 'MLB178990',
    'calcas-feminino': 'MLB178991',
    'blusas-feminino': 'MLB178992',
    'saias-feminino': 'MLB178993',
    'conjuntos-feminino': 'MLB178994',
    'calcados-feminino': 'MLB31388',
    'roupas-masculino': 'MLB1430',
    'calcados-masculino': 'MLB1144',
    'roupas-infantil': 'MLB1384',
    'calcados-infantil': 'MLB31422'
}

/**
 * Busca produtos de concorrentes
 */
export async function searchCompetitors(category: string): Promise<CompetitorProduct[]> {
    console.log(`🔍 Buscando concorrentes em: ${category}`)

    try {
        const categoryId = CATEGORIES[category]

        if (!categoryId) {
            console.error(`Categoria ${category} não encontrada`)
            return []
        }

        // API PÚBLICA do Mercado Livre (SEM autenticação!)
        const url = `https://api.mercadolibre.com/sites/MLB/search?category=${categoryId}&limit=50&sort=sold_quantity_desc`

        console.log(`📡 URL: ${url}`)

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        if (!data.results || data.results.length === 0) {
            console.warn(`⚠️ Nenhum produto encontrado`)
            return []
        }

        const products: CompetitorProduct[] = data.results.map((item: any) => ({
            id: item.id,
            title: item.title,
            price: item.price,
            seller: {
                id: item.seller?.id || 0,
                nickname: item.seller?.nickname || 'Desconhecido'
            },
            permalink: item.permalink,
            thumbnail: item.thumbnail,
            sold_quantity: item.sold_quantity || 0,
            available_quantity: item.available_quantity || 0
        }))

        console.log(`✅ ${products.length} produtos encontrados!`)

        return products

    } catch (error) {
        console.error(`❌ Erro:`, error)
        return []
    }
}

/**
 * Analisa categoria
 */
export async function analyzeCategory(category: string): Promise<CategoryAnalysis> {
    const products = await searchCompetitors(category)

    if (products.length === 0) {
        return {
            category,
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

    // Calcular preços
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
            seller: product.seller.nickname,
            sellerId: sellerId,
            totalProducts: 0,
            totalPrice: 0,
            totalSales: 0
        }

        current.totalProducts++
        current.totalPrice += product.price
        current.totalSales += product.sold_quantity

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
        category,
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
