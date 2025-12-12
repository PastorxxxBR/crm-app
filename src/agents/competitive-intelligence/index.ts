import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

interface CompetitorProduct {
    id: string
    title: string
    price: number
    seller: {
        id: number
        nickname: string
        permalink: string
        reputation: any
    }
    permalink: string
    thumbnail: string
    sold_quantity: number
    available_quantity: number
    condition: string
    shipping: {
        free_shipping: boolean
    }
}

interface CompetitorAnalysis {
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
    insights: string
}

interface SellerInfo {
    id: number
    nickname: string
    registration_date: string
    country_id: string
    seller_reputation: any
    transactions: any
    // Dados adicionais do Google
    cnpj?: string
    razaoSocial?: string
    endereco?: string
    telefone?: string
    website?: string
}

/**
 * Competitive Intelligence Agent
 * 
 * Agente de Inteligência Competitiva que analisa concorrentes no Mercado Livre
 * - Busca produtos por categoria
 * - Analisa preços
 * - Identifica concorrentes
 * - Busca dados no Google (CNPJ, etc)
 * - Gera estratégias competitivas
 */
export class CompetitiveIntelligenceAgent {
    private baseUrl = 'https://api.mercadolibre.com'
    private model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

    // Categorias do Mercado Livre
    private categories = {
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
     * Busca produtos de concorrentes por categoria
     */
    async searchCompetitorProducts(
        category: string,
        limit: number = 50
    ): Promise<CompetitorProduct[]> {
        console.log(`🔍 Buscando concorrentes em: ${category}`)

        try {
            const categoryId = this.categories[category as keyof typeof this.categories]

            if (!categoryId) {
                console.error(`Categoria ${category} não encontrada`)
                return []
            }

            // Buscar produtos na categoria
            const response = await fetch(
                `${this.baseUrl}/sites/MLB/search?category=${categoryId}&limit=${limit}&sort=sold_quantity_desc`
            )

            if (!response.ok) {
                throw new Error(`Erro ao buscar produtos: ${response.statusText}`)
            }

            const data = await response.json()
            const products: CompetitorProduct[] = data.results || []

            console.log(`✅ ${products.length} produtos encontrados em ${category}`)

            return products

        } catch (error) {
            console.error(`Erro ao buscar produtos:`, error)
            return []
        }
    }

    /**
     * Analisa produtos por categoria
     */
    async analyzeCategory(category: string): Promise<CompetitorAnalysis> {
        console.log(`📊 Analisando categoria: ${category}`)

        const products = await this.searchCompetitorProducts(category, 100)

        if (products.length === 0) {
            return this.getEmptyAnalysis(category)
        }

        // Ordenar por preço
        const sortedByPrice = [...products].sort((a, b) => a.price - b.price)

        // Top 10 mais baratos
        const cheapest10 = sortedByPrice.slice(0, 10)

        // Top 10 mais caros
        const expensive10 = sortedByPrice.slice(-10).reverse()

        // Top 10 preço médio (do meio)
        const middleStart = Math.floor((sortedByPrice.length - 10) / 2)
        const average10 = sortedByPrice.slice(middleStart, middleStart + 10)

        // Calcular estatísticas de preço
        const prices = products.map(p => p.price)
        const priceRange = {
            min: Math.min(...prices),
            max: Math.max(...prices),
            avg: prices.reduce((a, b) => a + b, 0) / prices.length,
            median: this.calculateMedian(prices)
        }

        // Identificar top sellers
        const sellerMap = new Map<number, {
            seller: string
            sellerId: number
            totalProducts: number
            totalPrice: number
            totalSales: number
        }>()

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

        // Gerar insights com IA
        const insights = await this.generateInsights(category, {
            cheapest10,
            expensive10,
            average10,
            priceRange,
            topSellers
        })

        return {
            category,
            totalProducts: products.length,
            cheapest10,
            expensive10,
            average10,
            priceRange,
            topSellers,
            insights
        }
    }

    /**
     * Busca informações detalhadas do vendedor
     */
    async getSellerInfo(sellerId: number): Promise<SellerInfo | null> {
        console.log(`👤 Buscando informações do vendedor: ${sellerId}`)

        try {
            const response = await fetch(`${this.baseUrl}/users/${sellerId}`)

            if (!response.ok) {
                throw new Error(`Erro ao buscar vendedor: ${response.statusText}`)
            }

            const data = await response.json()

            // Buscar dados adicionais no Google
            const googleData = await this.searchSellerOnGoogle(data.nickname)

            return {
                ...data,
                ...googleData
            }

        } catch (error) {
            console.error(`Erro ao buscar vendedor:`, error)
            return null
        }
    }

    /**
     * Busca dados do vendedor no Google
     */
    async searchSellerOnGoogle(sellerName: string): Promise<{
        cnpj?: string
        razaoSocial?: string
        endereco?: string
        telefone?: string
        website?: string
    }> {
        console.log(`🔍 Buscando ${sellerName} no Google...`)

        try {
            const customSearchEngineId = process.env.GOOGLE_CX || '26a560df0bbc74234'
            const apiKey = process.env.GOOGLE_API_KEY || ''

            const searchQuery = `${sellerName} CNPJ razão social`
            const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${customSearchEngineId}&q=${encodeURIComponent(searchQuery)}&num=5`

            const response = await fetch(url)
            const data = await response.json()

            if (data.items && data.items.length > 0) {
                // Usar IA para extrair informações
                const snippets = data.items.map((item: any) => item.snippet).join('\n')

                const extracted = await this.extractCompanyInfo(sellerName, snippets)
                return extracted
            }

            return {}

        } catch (error) {
            console.error(`Erro ao buscar no Google:`, error)
            return {}
        }
    }

    /**
     * Extrai informações da empresa usando IA
     */
    private async extractCompanyInfo(sellerName: string, text: string): Promise<{
        cnpj?: string
        razaoSocial?: string
        endereco?: string
        telefone?: string
        website?: string
    }> {
        const prompt = `
Extraia as seguintes informações sobre a empresa "${sellerName}" do texto abaixo:

Texto:
${text}

Retorne APENAS um JSON com os campos encontrados:
{
  "cnpj": "XX.XXX.XXX/XXXX-XX",
  "razaoSocial": "Nome da empresa",
  "endereco": "Endereço completo",
  "telefone": "Telefone",
  "website": "Site"
}

Se não encontrar alguma informação, omita o campo. Retorne APENAS o JSON, sem texto adicional.
`

        try {
            const result = await this.model.generateContent(prompt)
            const response = result.response.text()

            const jsonMatch = response.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0])
            }
        } catch (error) {
            console.error('Erro ao extrair informações:', error)
        }

        return {}
    }

    /**
     * Gera insights com IA
     */
    private async generateInsights(category: string, data: any): Promise<string> {
        const prompt = `
Você é um especialista em inteligência competitiva e e-commerce.

Analise os dados da categoria "${category}" no Mercado Livre:

TOP 10 MAIS BARATOS:
${data.cheapest10.map((p: any, i: number) => `${i + 1}. ${p.title} - R$ ${p.price.toFixed(2)} (${p.sold_quantity} vendidos)`).join('\n')}

TOP 10 MAIS CAROS:
${data.expensive10.map((p: any, i: number) => `${i + 1}. ${p.title} - R$ ${p.price.toFixed(2)} (${p.sold_quantity} vendidos)`).join('\n')}

FAIXA DE PREÇO:
- Mínimo: R$ ${data.priceRange.min.toFixed(2)}
- Máximo: R$ ${data.priceRange.max.toFixed(2)}
- Média: R$ ${data.priceRange.avg.toFixed(2)}
- Mediana: R$ ${data.priceRange.median.toFixed(2)}

TOP VENDEDORES:
${data.topSellers.map((s: any, i: number) => `${i + 1}. ${s.seller} - ${s.totalProducts} produtos - ${s.totalSales} vendas - Preço médio: R$ ${s.avgPrice.toFixed(2)}`).join('\n')}

Forneça uma análise COMPLETA incluindo:

1. ANÁLISE DE PREÇOS
   - Estratégia de precificação dos concorrentes
   - Oportunidades de preço
   - Posicionamento ideal

2. ANÁLISE DE CONCORRENTES
   - Principais players
   - Estratégias que funcionam
   - Pontos fracos dos concorrentes

3. RECOMENDAÇÕES ESTRATÉGICAS
   - Como precificar para competir
   - Diferenciais a explorar
   - Produtos para adicionar

4. AÇÕES IMEDIATAS
   - O que fazer AGORA
   - Produtos para promover
   - Ajustes de preço

Seja MUITO específico e prático!
`

        const result = await this.model.generateContent(prompt)
        return result.response.text()
    }

    /**
     * Calcula mediana
     */
    private calculateMedian(numbers: number[]): number {
        const sorted = [...numbers].sort((a, b) => a - b)
        const middle = Math.floor(sorted.length / 2)

        if (sorted.length % 2 === 0) {
            return (sorted[middle - 1] + sorted[middle]) / 2
        }

        return sorted[middle]
    }

    /**
     * Retorna análise vazia
     */
    private getEmptyAnalysis(category: string): CompetitorAnalysis {
        return {
            category,
            totalProducts: 0,
            cheapest10: [],
            expensive10: [],
            average10: [],
            priceRange: { min: 0, max: 0, avg: 0, median: 0 },
            topSellers: [],
            insights: 'Nenhum produto encontrado nesta categoria.'
        }
    }

    /**
     * Analisa TODAS as categorias
     */
    async analyzeAllCategories(): Promise<Record<string, CompetitorAnalysis>> {
        console.log('📊 Analisando TODAS as categorias...')

        const results: Record<string, CompetitorAnalysis> = {}

        for (const category of Object.keys(this.categories)) {
            results[category] = await this.analyzeCategory(category)

            // Delay entre categorias
            await new Promise(resolve => setTimeout(resolve, 1000))
        }

        return results
    }

    /**
     * Compara seus produtos com concorrentes
     */
    async compareWithCompetitors(
        myProducts: Array<{ title: string; price: number; category: string }>,
        category: string
    ): Promise<string> {
        console.log(`⚖️ Comparando produtos com concorrentes em: ${category}`)

        const analysis = await this.analyzeCategory(category)

        const prompt = `
Você é um consultor de e-commerce especializado em estratégia competitiva.

MEUS PRODUTOS:
${myProducts.map((p, i) => `${i + 1}. ${p.title} - R$ ${p.price.toFixed(2)}`).join('\n')}

CONCORRENTES (TOP 10 MAIS BARATOS):
${analysis.cheapest10.map((p, i) => `${i + 1}. ${p.title} - R$ ${p.price.toFixed(2)} (${p.sold_quantity} vendidos)`).join('\n')}

FAIXA DE PREÇO DO MERCADO:
- Mínimo: R$ ${analysis.priceRange.min.toFixed(2)}
- Máximo: R$ ${analysis.priceRange.max.toFixed(2)}
- Média: R$ ${analysis.priceRange.avg.toFixed(2)}

Analise e forneça:

1. POSICIONAMENTO DOS MEUS PRODUTOS
   - Estão caros ou baratos?
   - Onde se encaixam no mercado?

2. AJUSTES RECOMENDADOS
   - Produtos para baixar preço
   - Produtos para subir preço
   - Produtos competitivos

3. ESTRATÉGIA PARA VENCER
   - Como bater os concorrentes
   - Diferenciais a explorar
   - Oportunidades de mercado

4. AÇÕES ESPECÍFICAS
   - Ajustes de preço exatos
   - Produtos para promover
   - Novos produtos para adicionar

Seja MUITO específico com valores e ações!
`

        const result = await this.model.generateContent(prompt)
        return result.response.text()
    }
}

// Exportar instância
export const competitiveAgent = new CompetitiveIntelligenceAgent()
