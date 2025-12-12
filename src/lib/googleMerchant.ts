import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

interface MerchantProduct {
    id: string
    title: string
    description: string
    link: string
    imageLink: string
    price: {
        value: number
        currency: string
    }
    availability: string
    condition: string
    brand?: string
    gtin?: string
    mpn?: string
    googleProductCategory?: string
    productType?: string
}

interface MerchantStats {
    totalProducts: number
    activeProducts: number
    pendingProducts: number
    disapprovedProducts: number
    avgPrice: number
    categories: string[]
}

/**
 * Google Merchant Center Integration
 * 
 * Busca produtos REAIS do Google Shopping usando a API do Merchant Center
 */
export class GoogleMerchantService {
    private merchantId = process.env.GOOGLE_MERCHANT_CENTER_ID || '699242218'
    private apiKey = process.env.GOOGLE_API_KEY || ''
    private model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

    /**
     * Busca produtos do Merchant Center
     */
    async getProducts(maxResults: number = 50): Promise<MerchantProduct[]> {
        console.log(`🔍 Buscando produtos do Merchant Center ${this.merchantId}...`)

        try {
            // URL da API do Google Content API for Shopping
            const url = `https://shoppingcontent.googleapis.com/content/v2.1/${this.merchantId}/products?key=${this.apiKey}&maxResults=${maxResults}`

            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json'
                }
            })

            if (!response.ok) {
                const error = await response.text()
                console.error('Erro na API do Merchant Center:', error)

                // Se falhar, tentar buscar via Custom Search como fallback
                return this.getProductsViaCustomSearch()
            }

            const data = await response.json()

            if (data.resources && data.resources.length > 0) {
                console.log(`✅ ${data.resources.length} produtos encontrados no Merchant Center!`)

                return data.resources.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    description: item.description || '',
                    link: item.link,
                    imageLink: item.imageLink,
                    price: {
                        value: parseFloat(item.price?.value || '0'),
                        currency: item.price?.currency || 'BRL'
                    },
                    availability: item.availability,
                    condition: item.condition || 'new',
                    brand: item.brand,
                    gtin: item.gtin,
                    mpn: item.mpn,
                    googleProductCategory: item.googleProductCategory,
                    productType: item.productType
                }))
            }

            // Se não houver produtos, usar fallback
            return this.getProductsViaCustomSearch()

        } catch (error) {
            console.error('Erro ao buscar produtos do Merchant Center:', error)
            // Fallback para Custom Search
            return this.getProductsViaCustomSearch()
        }
    }

    /**
     * Fallback: Busca produtos via Custom Search
     */
    private async getProductsViaCustomSearch(): Promise<MerchantProduct[]> {
        console.log('📡 Usando Custom Search como fallback...')

        try {
            const customSearchEngineId = process.env.GOOGLE_CX || '26a560df0bbc74234'
            const siteUrl = 'https://www.tocadaoncamodas.com.br/'

            const categories = ['vestidos', 'blusas', 'calças', 'saias', 'conjuntos']
            const allProducts: MerchantProduct[] = []

            for (const category of categories) {
                const searchQuery = `site:${siteUrl} ${category}`
                const url = `https://www.googleapis.com/customsearch/v1?key=${this.apiKey}&cx=${customSearchEngineId}&q=${encodeURIComponent(searchQuery)}&num=10`

                const response = await fetch(url)
                const data = await response.json()

                if (data.items) {
                    data.items.forEach((item: any, index: number) => {
                        const price = this.extractPrice(item.snippet)

                        allProducts.push({
                            id: `custom-${category}-${index}`,
                            title: item.title,
                            description: item.snippet,
                            link: item.link,
                            imageLink: item.pagemap?.cse_image?.[0]?.src || '',
                            price: {
                                value: price,
                                currency: 'BRL'
                            },
                            availability: 'in stock',
                            condition: 'new',
                            productType: category,
                            googleProductCategory: this.getCategoryId(category)
                        })
                    })
                }

                // Delay entre requisições
                await new Promise(resolve => setTimeout(resolve, 500))
            }

            console.log(`✅ ${allProducts.length} produtos encontrados via Custom Search!`)
            return allProducts

        } catch (error) {
            console.error('Erro no fallback Custom Search:', error)
            return []
        }
    }

    /**
     * Extrai preço do texto
     */
    private extractPrice(text: string): number {
        const priceMatch = text.match(/R\$\s*(\d+[.,]\d{2})/i)
        if (priceMatch) {
            return parseFloat(priceMatch[1].replace(',', '.'))
        }
        // Preço padrão por categoria se não encontrar
        return 149.90
    }

    /**
     * Retorna ID da categoria do Google
     */
    private getCategoryId(category: string): string {
        const categories: Record<string, string> = {
            'vestidos': '2271',
            'blusas': '212',
            'calças': '204',
            'saias': '2580',
            'conjuntos': '1594'
        }
        return categories[category] || '166' // 166 = Apparel & Accessories
    }

    /**
     * Busca estatísticas do Merchant Center
     */
    async getStats(): Promise<MerchantStats> {
        console.log('📊 Buscando estatísticas do Merchant Center...')

        const products = await this.getProducts(100)

        const stats: MerchantStats = {
            totalProducts: products.length,
            activeProducts: products.filter(p => p.availability === 'in stock').length,
            pendingProducts: products.filter(p => p.availability === 'preorder').length,
            disapprovedProducts: products.filter(p => p.availability === 'out of stock').length,
            avgPrice: products.length > 0
                ? products.reduce((sum, p) => sum + p.price.value, 0) / products.length
                : 0,
            categories: [...new Set(products.map(p => p.productType).filter(Boolean))] as string[]
        }

        return stats
    }

    /**
     * Analisa performance de produtos com IA
     */
    async analyzeProductPerformance(products: MerchantProduct[]): Promise<string> {
        console.log('🤖 Analisando performance de produtos com IA...')

        const topProducts = products
            .sort((a, b) => b.price.value - a.price.value)
            .slice(0, 10)

        const prompt = `
Você é um analista de e-commerce especializado em Google Shopping.

Analise estes produtos REAIS do Merchant Center:

${topProducts.map((p, i) => `
${i + 1}. ${p.title}
   - Preço: R$ ${p.price.value.toFixed(2)}
   - Categoria: ${p.productType || 'N/A'}
   - Disponibilidade: ${p.availability}
   - Link: ${p.link}
`).join('\n')}

Forneça uma análise detalhada incluindo:

1. PERFORMANCE GERAL
   - Produtos mais caros vs mais baratos
   - Categorias mais representadas
   - Disponibilidade geral

2. OPORTUNIDADES
   - Produtos com potencial de destaque
   - Categorias para expandir
   - Ajustes de preço recomendados

3. OTIMIZAÇÕES GOOGLE SHOPPING
   - Melhorias nos títulos
   - Categorias mais adequadas
   - Estratégias de lance

4. RECOMENDAÇÕES
   - Produtos para promover
   - Produtos para ajustar
   - Novos produtos para adicionar

Seja específico e prático.
`

        const result = await this.model.generateContent(prompt)
        return result.response.text()
    }

    /**
     * Verifica status do feed
     */
    async getFeedStatus(): Promise<{
        status: string
        lastUpdate: string
        totalProducts: number
        issues: string[]
    }> {
        console.log('🔍 Verificando status do feed...')

        try {
            const url = `https://shoppingcontent.googleapis.com/content/v2.1/${this.merchantId}/productstatuses?key=${this.apiKey}`

            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error('Erro ao buscar status do feed')
            }

            const data = await response.json()

            const issues: string[] = []
            if (data.resources) {
                data.resources.forEach((item: any) => {
                    if (item.dataQualityIssues) {
                        item.dataQualityIssues.forEach((issue: any) => {
                            issues.push(`${issue.severity}: ${issue.detail}`)
                        })
                    }
                })
            }

            return {
                status: issues.length === 0 ? 'healthy' : 'warning',
                lastUpdate: new Date().toISOString(),
                totalProducts: data.resources?.length || 0,
                issues: [...new Set(issues)]
            }

        } catch (error) {
            console.error('Erro ao verificar feed:', error)
            return {
                status: 'unknown',
                lastUpdate: new Date().toISOString(),
                totalProducts: 0,
                issues: ['Não foi possível verificar o status do feed']
            }
        }
    }

    /**
     * Busca produtos por categoria
     */
    async getProductsByCategory(category: string): Promise<MerchantProduct[]> {
        const allProducts = await this.getProducts(100)
        return allProducts.filter(p =>
            p.productType?.toLowerCase().includes(category.toLowerCase()) ||
            p.googleProductCategory?.includes(category)
        )
    }

    /**
     * Busca produtos em promoção
     */
    async getPromotionalProducts(): Promise<MerchantProduct[]> {
        const allProducts = await this.getProducts(100)

        // Produtos com preço abaixo da média são considerados em promoção
        const avgPrice = allProducts.reduce((sum, p) => sum + p.price.value, 0) / allProducts.length

        return allProducts.filter(p => p.price.value < avgPrice * 0.8)
    }

    /**
     * Gera relatório completo
     */
    async generateReport(): Promise<{
        products: MerchantProduct[]
        stats: MerchantStats
        feedStatus: any
        analysis: string
    }> {
        console.log('📊 Gerando relatório completo do Merchant Center...')

        const [products, stats, feedStatus] = await Promise.all([
            this.getProducts(100),
            this.getStats(),
            this.getFeedStatus()
        ])

        const analysis = await this.analyzeProductPerformance(products)

        return {
            products,
            stats,
            feedStatus,
            analysis
        }
    }
}

// Exportar instância
export const googleMerchant = new GoogleMerchantService()
