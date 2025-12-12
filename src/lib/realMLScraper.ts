/**
 * Real Mercado Livre Scraper
 * 
 * Busca dados REAIS do Mercado Livre usando busca por termo
 * Igual ao link que o usuário forneceu
 */

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
    installments?: {
        quantity: number
        amount: number
    }
}

interface RealAnalysis {
    searchTerm: string
    totalProducts: number
    products: RealProduct[]
    priceStats: {
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

/**
 * Busca produtos REAIS por termo de busca
 */
export async function searchRealProducts(searchTerm: string, limit: number = 50): Promise<RealProduct[]> {
    console.log(`🔍 Buscando: "${searchTerm}"`)

    try {
        // URL da API do Mercado Livre (busca por termo)
        const url = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(searchTerm)}&limit=${limit}`

        console.log(`📡 URL: ${url}`)

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            }
        })

        if (!response.ok) {
            throw new Error(`Erro ${response.status}`)
        }

        const data = await response.json()

        if (!data.results || data.results.length === 0) {
            console.warn(`⚠️ Nenhum produto encontrado para "${searchTerm}"`)
            return []
        }

        const products: RealProduct[] = data.results.map((item: any) => {
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
                    link: item.seller?.permalink || '',
                    reputation: item.seller?.seller_reputation
                },
                link: item.permalink,
                image: item.thumbnail?.replace('-I.jpg', '-O.jpg') || item.thumbnail,
                soldQuantity: item.sold_quantity || 0,
                freeShipping: item.shipping?.free_shipping || false,
                installments: item.installments ? {
                    quantity: item.installments.quantity,
                    amount: item.installments.amount
                } : undefined
            }
        })

        console.log(`✅ ${products.length} produtos encontrados!`)

        return products

    } catch (error) {
        console.error(`❌ Erro ao buscar:`, error)
        return []
    }
}

/**
 * Analisa produtos por termo de busca
 */
export async function analyzeRealProducts(searchTerm: string): Promise<RealAnalysis> {
    const products = await searchRealProducts(searchTerm, 50)

    if (products.length === 0) {
        return {
            searchTerm,
            totalProducts: 0,
            products: [],
            priceStats: { min: 0, max: 0, avg: 0, median: 0 },
            topSellers: []
        }
    }

    // Calcular estatísticas de preço
    const prices = products.map(p => p.price)
    const priceStats = {
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
        searchTerm,
        totalProducts: products.length,
        products,
        priceStats,
        topSellers
    }
}

/**
 * Busca informações detalhadas do vendedor
 */
export async function getSellerDetails(sellerId: number): Promise<any> {
    console.log(`👤 Buscando vendedor: ${sellerId}`)

    try {
        const response = await fetch(`https://api.mercadolibre.com/users/${sellerId}`)

        if (!response.ok) {
            throw new Error(`Erro ${response.status}`)
        }

        const data = await response.json()

        // Buscar redes sociais no Google
        const socialMedia = await searchSocialMedia(data.nickname)

        return {
            id: data.id,
            nickname: data.nickname,
            registrationDate: data.registration_date,
            countryId: data.country_id,
            address: data.address,
            reputation: data.seller_reputation,
            transactions: data.transactions,
            socialMedia
        }

    } catch (error) {
        console.error(`❌ Erro ao buscar vendedor:`, error)
        return null
    }
}

/**
 * Busca redes sociais do vendedor no Google
 */
async function searchSocialMedia(sellerName: string): Promise<{
    instagram?: string
    facebook?: string
    website?: string
}> {
    try {
        const apiKey = process.env.GOOGLE_API_KEY || ''
        const cx = process.env.GOOGLE_CX || ''

        const query = `${sellerName} instagram facebook site`
        const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=5`

        const response = await fetch(url)
        const data = await response.json()

        const socialMedia: any = {}

        if (data.items) {
            data.items.forEach((item: any) => {
                const link = item.link.toLowerCase()

                if (link.includes('instagram.com') && !socialMedia.instagram) {
                    socialMedia.instagram = item.link
                }
                if (link.includes('facebook.com') && !socialMedia.facebook) {
                    socialMedia.facebook = item.link
                }
                if (!link.includes('mercadolivre') && !link.includes('instagram') && !link.includes('facebook') && !socialMedia.website) {
                    socialMedia.website = item.link
                }
            })
        }

        return socialMedia

    } catch (error) {
        console.error('Erro ao buscar redes sociais:', error)
        return {}
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
 * Termos de busca por categoria
 */
export const SEARCH_TERMS = {
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
