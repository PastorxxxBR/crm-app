import { GoogleGenerativeAI } from '@google/generative-ai'
import { mlTokenManager } from './mlTokenManager'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

interface MercadoLivreProduct {
    id: string
    title: string
    price: number
    currency_id: string
    available_quantity: number
    sold_quantity: number
    condition: string
    thumbnail: string
    permalink: string
    status: string
    category_id: string
    listing_type_id: string
    shipping?: {
        free_shipping: boolean
    }
}

interface MercadoLivreOrder {
    id: number
    status: string
    date_created: string
    total_amount: number
    currency_id: string
    buyer: {
        id: number
        nickname: string
    }
    items: Array<{
        title: string
        quantity: number
        unit_price: number
    }>
}

interface MercadoLivreStats {
    totalProducts: number
    activeProducts: number
    pausedProducts: number
    totalSales: number
    totalRevenue: number
    avgPrice: number
    avgSoldQuantity: number
}

/**
 * Mercado Livre Integration Service
 * 
 * Integração completa com API do Mercado Livre
 * Busca produtos REAIS, vendas, estatísticas e muito mais
 */
export class MercadoLivreService {
    private clientId = process.env.MERCADOLIVRE_CLIENT_ID || '8915788255273924'
    private clientSecret = process.env.MERCADOLIVRE_CLIENT_SECRET || 'oA2rpmIX1gSjLjhoTKgM4dBlpmvA9cIY'
    private accessToken = process.env.MERCADOLIVRE_ACCESS_TOKEN || 'TG-693b75be7d7388000195d127-680750537'
    private baseUrl = 'https://api.mercadolibre.com'
    private model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

    /**
     * Busca informações do usuário/vendedor
     */
    async getUserInfo(): Promise<any> {
        console.log('👤 Buscando informações do vendedor...')

        try {
            const response = await fetch(`${this.baseUrl}/users/me`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            })

            if (!response.ok) {
                throw new Error(`Erro ao buscar usuário: ${response.statusText}`)
            }

            const data = await response.json()
            console.log(`✅ Vendedor: ${data.nickname} (ID: ${data.id})`)

            return data
        } catch (error) {
            console.error('Erro ao buscar usuário:', error)
            throw error
        }
    }

    /**
     * Busca TODOS os produtos do vendedor
     */
    async getProducts(limit: number = 50): Promise<MercadoLivreProduct[]> {
        console.log('🔍 Buscando produtos do Mercado Livre...')

        try {
            // Primeiro, pegar o user ID
            const user = await this.getUserInfo()
            const userId = user.id

            // Buscar IDs dos produtos
            const searchResponse = await fetch(
                `${this.baseUrl}/users/${userId}/items/search?limit=${limit}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            )

            if (!searchResponse.ok) {
                throw new Error(`Erro ao buscar produtos: ${searchResponse.statusText}`)
            }

            const searchData = await searchResponse.json()
            const productIds = searchData.results || []

            console.log(`📦 Encontrados ${productIds.length} produtos`)

            // Buscar detalhes de cada produto
            const products: MercadoLivreProduct[] = []

            for (const productId of productIds.slice(0, limit)) {
                try {
                    const productResponse = await fetch(
                        `${this.baseUrl}/items/${productId}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${this.accessToken}`
                            }
                        }
                    )

                    if (productResponse.ok) {
                        const product = await productResponse.json()
                        products.push(product)
                    }

                    // Delay para não sobrecarregar a API
                    await new Promise(resolve => setTimeout(resolve, 200))
                } catch (error) {
                    console.error(`Erro ao buscar produto ${productId}:`, error)
                }
            }

            console.log(`✅ ${products.length} produtos carregados com sucesso!`)
            return products

        } catch (error) {
            console.error('Erro ao buscar produtos:', error)
            return []
        }
    }

    /**
     * Busca pedidos/vendas
     */
    async getOrders(limit: number = 50): Promise<MercadoLivreOrder[]> {
        console.log('📊 Buscando pedidos do Mercado Livre...')

        try {
            const user = await this.getUserInfo()
            const userId = user.id

            const response = await fetch(
                `${this.baseUrl}/orders/search?seller=${userId}&limit=${limit}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            )

            if (!response.ok) {
                throw new Error(`Erro ao buscar pedidos: ${response.statusText}`)
            }

            const data = await response.json()
            const orders = data.results || []

            console.log(`✅ ${orders.length} pedidos encontrados!`)
            return orders

        } catch (error) {
            console.error('Erro ao buscar pedidos:', error)
            return []
        }
    }

    /**
     * Calcula estatísticas REAIS
     */
    async getStats(): Promise<MercadoLivreStats> {
        console.log('📊 Calculando estatísticas...')

        const [products, orders] = await Promise.all([
            this.getProducts(100),
            this.getOrders(100)
        ])

        const stats: MercadoLivreStats = {
            totalProducts: products.length,
            activeProducts: products.filter(p => p.status === 'active').length,
            pausedProducts: products.filter(p => p.status === 'paused').length,
            totalSales: orders.length,
            totalRevenue: orders.reduce((sum, order) => sum + order.total_amount, 0),
            avgPrice: products.length > 0
                ? products.reduce((sum, p) => sum + p.price, 0) / products.length
                : 0,
            avgSoldQuantity: products.length > 0
                ? products.reduce((sum, p) => sum + p.sold_quantity, 0) / products.length
                : 0
        }

        return stats
    }

    /**
     * Busca produtos por categoria
     */
    async getProductsByCategory(categoryId: string): Promise<MercadoLivreProduct[]> {
        const allProducts = await this.getProducts(100)
        return allProducts.filter(p => p.category_id === categoryId)
    }

    /**
     * Busca produtos mais vendidos
     */
    async getBestSellers(limit: number = 10): Promise<MercadoLivreProduct[]> {
        const products = await this.getProducts(100)
        return products
            .sort((a, b) => b.sold_quantity - a.sold_quantity)
            .slice(0, limit)
    }

    /**
     * Busca produtos com frete grátis
     */
    async getFreeShippingProducts(): Promise<MercadoLivreProduct[]> {
        const products = await this.getProducts(100)
        return products.filter(p => p.shipping?.free_shipping === true)
    }

    /**
     * Analisa performance com IA
     */
    async analyzePerformance(): Promise<string> {
        console.log('🤖 Analisando performance com IA...')

        const [products, orders, stats] = await Promise.all([
            this.getProducts(20),
            this.getOrders(20),
            this.getStats()
        ])

        const bestSellers = products
            .sort((a, b) => b.sold_quantity - a.sold_quantity)
            .slice(0, 5)

        const prompt = `
Você é um especialista em vendas no Mercado Livre.

Analise estes dados REAIS da loja:

ESTATÍSTICAS GERAIS:
- Total de Produtos: ${stats.totalProducts}
- Produtos Ativos: ${stats.activeProducts}
- Produtos Pausados: ${stats.pausedProducts}
- Total de Vendas: ${stats.totalSales}
- Receita Total: R$ ${stats.totalRevenue.toFixed(2)}
- Preço Médio: R$ ${stats.avgPrice.toFixed(2)}
- Média de Vendas por Produto: ${stats.avgSoldQuantity.toFixed(0)} unidades

TOP 5 PRODUTOS MAIS VENDIDOS:
${bestSellers.map((p, i) => `
${i + 1}. ${p.title}
   - Preço: R$ ${p.price.toFixed(2)}
   - Vendidos: ${p.sold_quantity} unidades
   - Disponível: ${p.available_quantity} unidades
   - Status: ${p.status}
   - Frete Grátis: ${p.shipping?.free_shipping ? 'Sim' : 'Não'}
`).join('\n')}

ÚLTIMOS PEDIDOS:
${orders.slice(0, 5).map((o, i) => `
${i + 1}. Pedido #${o.id}
   - Valor: R$ ${o.total_amount.toFixed(2)}
   - Status: ${o.status}
   - Data: ${new Date(o.date_created).toLocaleDateString('pt-BR')}
   - Comprador: ${o.buyer.nickname}
`).join('\n')}

Forneça uma análise COMPLETA incluindo:

1. PERFORMANCE GERAL
   - Avaliação da loja
   - Pontos fortes
   - Pontos fracos

2. ANÁLISE DE PRODUTOS
   - Produtos que vendem bem
   - Produtos que não vendem
   - Oportunidades de precificação

3. ESTRATÉGIAS DE CRESCIMENTO
   - Como aumentar vendas
   - Produtos para promover
   - Melhorias no catálogo

4. RECOMENDAÇÕES ESPECÍFICAS
   - Ações imediatas
   - Otimizações de anúncios
   - Estratégias de frete

5. METAS SUGERIDAS
   - Metas de vendas
   - Metas de faturamento
   - Produtos para adicionar

Seja MUITO específico e prático!
`

        const result = await this.model.generateContent(prompt)
        return result.response.text()
    }

    /**
     * Gera relatório completo
     */
    async generateReport(): Promise<{
        user: any
        products: MercadoLivreProduct[]
        orders: MercadoLivreOrder[]
        stats: MercadoLivreStats
        bestSellers: MercadoLivreProduct[]
        analysis: string
    }> {
        console.log('📊 Gerando relatório completo do Mercado Livre...')

        const [user, products, orders, stats] = await Promise.all([
            this.getUserInfo(),
            this.getProducts(50),
            this.getOrders(50),
            this.getStats()
        ])

        const bestSellers = products
            .sort((a, b) => b.sold_quantity - a.sold_quantity)
            .slice(0, 10)

        const analysis = await this.analyzePerformance()

        return {
            user,
            products,
            orders,
            stats,
            bestSellers,
            analysis
        }
    }

    /**
     * Busca vendas por período
     */
    async getSalesByPeriod(days: number = 30): Promise<{
        totalSales: number
        totalRevenue: number
        avgTicket: number
        salesByDay: Array<{ date: string; sales: number; revenue: number }>
    }> {
        const orders = await this.getOrders(100)

        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)

        const recentOrders = orders.filter(order =>
            new Date(order.date_created) >= cutoffDate
        )

        // Agrupar por dia
        const salesByDay = new Map<string, { sales: number; revenue: number }>()

        recentOrders.forEach(order => {
            const date = new Date(order.date_created).toLocaleDateString('pt-BR')
            const current = salesByDay.get(date) || { sales: 0, revenue: 0 }

            salesByDay.set(date, {
                sales: current.sales + 1,
                revenue: current.revenue + order.total_amount
            })
        })

        const totalRevenue = recentOrders.reduce((sum, o) => sum + o.total_amount, 0)

        return {
            totalSales: recentOrders.length,
            totalRevenue,
            avgTicket: recentOrders.length > 0 ? totalRevenue / recentOrders.length : 0,
            salesByDay: Array.from(salesByDay.entries()).map(([date, data]) => ({
                date,
                ...data
            }))
        }
    }

    /**
     * Verifica status da integração
     */
    async checkConnection(): Promise<{
        connected: boolean
        user?: any
        error?: string
    }> {
        try {
            const user = await this.getUserInfo()
            return {
                connected: true,
                user
            }
        } catch (error: any) {
            return {
                connected: false,
                error: error.message
            }
        }
    }
}

// Exportar instância
export const mercadoLivreService = new MercadoLivreService()
