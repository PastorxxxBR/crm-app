import axios from 'axios'

/**
 * Google Custom Search para encontrar produtos em marketplaces
 */
export async function searchGoogleForProducts(
    productName: string,
    marketplace: string
): Promise<any[]> {
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
    const GOOGLE_CX = process.env.GOOGLE_CX // Custom Search Engine ID

    if (!GOOGLE_API_KEY || !GOOGLE_CX) {
        console.warn('Google API credentials not configured')
        return []
    }

    try {
        const searchQuery = `${productName} site:${getMarketplaceDomain(marketplace)}`
        const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
            params: {
                key: GOOGLE_API_KEY,
                cx: GOOGLE_CX,
                q: searchQuery,
                num: 10,
            },
        })

        return response.data.items || []
    } catch (error) {
        console.error('Google Search API error:', error)
        return []
    }
}

/**
 * Extrai preço de resultado de busca
 */
export function extractPriceFromResult(item: any, marketplace: string): number | null {
    try {
        const snippet = item.snippet || ''
        const title = item.title || ''
        const text = `${title} ${snippet}`

        // Regex para encontrar preços no formato brasileiro
        const priceRegex = /R\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/g
        const matches = text.match(priceRegex)

        if (matches && matches.length > 0) {
            // Pega o primeiro preço encontrado
            const priceStr = matches[0].replace('R$', '').trim()
            const price = parseFloat(priceStr.replace(/\./g, '').replace(',', '.'))
            return price
        }

        return null
    } catch (error) {
        return null
    }
}

/**
 * Scraping direto de marketplace (fallback se Google API não funcionar)
 */
export async function scrapeMarketplace(
    productName: string,
    marketplace: string
): Promise<any[]> {
    // Por enquanto retorna mock, depois implementamos scraping real
    // com Cheerio ou Puppeteer
    return getMockPrices(productName, marketplace)
}

/**
 * Dados mock enquanto APIs não estão configuradas
 */
function getMockPrices(productName: string, marketplace: string): any[] {
    const basePrice = Math.random() * 100 + 30

    return [
        {
            title: `${productName} - Loja A`,
            price: basePrice + Math.random() * 20 - 10,
            seller: 'Loja A Oficial',
            url: `https://${getMarketplaceDomain(marketplace)}/produto-${Date.now()}`,
            marketplace,
        },
        {
            title: `${productName} - Loja B`,
            price: basePrice + Math.random() * 20 - 10,
            seller: 'Loja B Store',
            url: `https://${getMarketplaceDomain(marketplace)}/produto-${Date.now() + 1}`,
            marketplace,
        },
        {
            title: `${productName} - Loja C`,
            price: basePrice + Math.random() * 20 - 10,
            seller: 'Loja C Fashion',
            url: `https://${getMarketplaceDomain(marketplace)}/produto-${Date.now() + 2}`,
            marketplace,
        },
    ]
}

/**
 * Retorna domínio do marketplace
 */
function getMarketplaceDomain(marketplace: string): string {
    const domains: Record<string, string> = {
        mercadolivre: 'mercadolivre.com.br',
        shopee: 'shopee.com.br',
        amazon: 'amazon.com.br',
        magalu: 'magazineluiza.com.br',
    }
    return domains[marketplace] || marketplace
}

/**
 * Calcula estatísticas de preços
 */
export function calculatePriceStats(prices: number[]) {
    if (prices.length === 0) return null

    const sortedPrices = [...prices].sort((a, b) => a - b)

    return {
        min: sortedPrices[0],
        max: sortedPrices[sortedPrices.length - 1],
        avg: prices.reduce((sum, p) => sum + p, 0) / prices.length,
        median: sortedPrices[Math.floor(sortedPrices.length / 2)],
        count: prices.length,
    }
}
