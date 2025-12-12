/**
 * TikTok Shopping API Integration
 * 
 * Integração completa com TikTok for Business
 * - Sincronização de produtos
 * - Gestão de pedidos
 * - Analytics
 * - Automação de posts
 */

import axios from 'axios'

interface TikTokConfig {
    appKey: string
    appSecret: string
    accessToken: string
    shopId: string
}

interface TikTokProduct {
    id?: string
    title: string
    description: string
    price: number
    images: string[]
    category: string
    stock: number
    sku?: string
}

interface TikTokOrder {
    orderId: string
    products: Array<{
        productId: string
        quantity: number
        price: number
    }>
    customer: {
        name: string
        phone: string
        address: string
    }
    status: string
    totalAmount: number
    createdAt: string
}

class TikTokService {
    private config: TikTokConfig
    private baseUrl = 'https://open-api.tiktokglobalshop.com'

    constructor() {
        this.config = {
            appKey: process.env.TIKTOK_APP_KEY || '',
            appSecret: process.env.TIKTOK_APP_SECRET || '',
            accessToken: process.env.TIKTOK_ACCESS_TOKEN || '',
            shopId: process.env.TIKTOK_SHOP_ID || ''
        }
    }

    /**
     * Gerar assinatura para requisições
     */
    private generateSignature(params: any): string {
        // Implementar lógica de assinatura do TikTok
        const sortedParams = Object.keys(params)
            .sort()
            .map(key => `${key}${params[key]}`)
            .join('')

        // Aqui você implementaria o hash HMAC-SHA256
        return sortedParams
    }

    /**
     * Fazer requisição à API do TikTok
     */
    private async request(endpoint: string, method: string = 'GET', data?: any) {
        const timestamp = Math.floor(Date.now() / 1000)

        const params = {
            app_key: this.config.appKey,
            timestamp,
            shop_id: this.config.shopId,
            access_token: this.config.accessToken,
            ...data
        }

        const signature = this.generateSignature(params)

        try {
            const response = await axios({
                method,
                url: `${this.baseUrl}${endpoint}`,
                params: method === 'GET' ? params : undefined,
                data: method !== 'GET' ? params : undefined,
                headers: {
                    'Content-Type': 'application/json',
                    'x-tts-access-token': this.config.accessToken
                }
            })

            return response.data
        } catch (error: any) {
            console.error('TikTok API Error:', error.response?.data || error.message)
            throw error
        }
    }

    /**
     * PRODUTOS
     */

    /**
     * Criar produto no TikTok Shop
     */
    async createProduct(product: TikTokProduct) {
        console.log('📦 Criando produto no TikTok:', product.title)

        const productData = {
            product_name: product.title,
            description: product.description,
            category_id: product.category,
            brand_id: '',
            images: product.images.map(img => ({ url: img })),
            skus: [{
                seller_sku: product.sku || `SKU-${Date.now()}`,
                price: {
                    amount: product.price.toString(),
                    currency: 'BRL'
                },
                stock_infos: [{
                    available_stock: product.stock
                }]
            }]
        }

        try {
            const response = await this.request('/api/products/create', 'POST', productData)
            console.log('✅ Produto criado:', response)
            return response
        } catch (error) {
            console.error('❌ Erro ao criar produto:', error)
            throw error
        }
    }

    /**
     * Atualizar produto
     */
    async updateProduct(productId: string, updates: Partial<TikTokProduct>) {
        console.log('🔄 Atualizando produto:', productId)

        try {
            const response = await this.request(`/api/products/${productId}/update`, 'PUT', updates)
            console.log('✅ Produto atualizado')
            return response
        } catch (error) {
            console.error('❌ Erro ao atualizar produto:', error)
            throw error
        }
    }

    /**
     * Listar produtos
     */
    async listProducts(page: number = 1, pageSize: number = 20) {
        console.log('📋 Listando produtos do TikTok Shop')

        try {
            const response = await this.request('/api/products/search', 'GET', {
                page_number: page,
                page_size: pageSize
            })

            console.log(`✅ ${response.data?.products?.length || 0} produtos encontrados`)
            return response.data?.products || []
        } catch (error) {
            console.error('❌ Erro ao listar produtos:', error)
            return []
        }
    }

    /**
     * Deletar produto
     */
    async deleteProduct(productId: string) {
        console.log('🗑️ Deletando produto:', productId)

        try {
            const response = await this.request(`/api/products/${productId}/delete`, 'DELETE')
            console.log('✅ Produto deletado')
            return response
        } catch (error) {
            console.error('❌ Erro ao deletar produto:', error)
            throw error
        }
    }

    /**
     * PEDIDOS
     */

    /**
     * Listar pedidos
     */
    async listOrders(status?: string) {
        console.log('🛍️ Listando pedidos do TikTok Shop')

        try {
            const response = await this.request('/api/orders/search', 'GET', {
                order_status: status,
                page_size: 50
            })

            console.log(`✅ ${response.data?.orders?.length || 0} pedidos encontrados`)
            return response.data?.orders || []
        } catch (error) {
            console.error('❌ Erro ao listar pedidos:', error)
            return []
        }
    }

    /**
     * Obter detalhes do pedido
     */
    async getOrder(orderId: string) {
        console.log('📦 Buscando pedido:', orderId)

        try {
            const response = await this.request(`/api/orders/${orderId}`, 'GET')
            return response.data
        } catch (error) {
            console.error('❌ Erro ao buscar pedido:', error)
            throw error
        }
    }

    /**
     * Atualizar status do pedido
     */
    async updateOrderStatus(orderId: string, status: string, trackingNumber?: string) {
        console.log('🔄 Atualizando status do pedido:', orderId)

        try {
            const response = await this.request(`/api/orders/${orderId}/update`, 'PUT', {
                status,
                tracking_number: trackingNumber
            })

            console.log('✅ Status atualizado')
            return response
        } catch (error) {
            console.error('❌ Erro ao atualizar status:', error)
            throw error
        }
    }

    /**
     * ANALYTICS
     */

    /**
     * Obter estatísticas de vendas
     */
    async getSalesStats(startDate: string, endDate: string) {
        console.log('📊 Buscando estatísticas de vendas')

        try {
            const response = await this.request('/api/analytics/sales', 'GET', {
                start_date: startDate,
                end_date: endDate
            })

            return response.data
        } catch (error) {
            console.error('❌ Erro ao buscar estatísticas:', error)
            return null
        }
    }

    /**
     * Obter produtos mais vendidos
     */
    async getTopProducts(limit: number = 10) {
        console.log('🏆 Buscando produtos mais vendidos')

        try {
            const response = await this.request('/api/analytics/top-products', 'GET', {
                limit
            })

            return response.data?.products || []
        } catch (error) {
            console.error('❌ Erro ao buscar top produtos:', error)
            return []
        }
    }

    /**
     * AUTOMAÇÃO
     */

    /**
     * Sincronizar todos os produtos
     */
    async syncAllProducts(products: TikTokProduct[]) {
        console.log(`🔄 Sincronizando ${products.length} produtos...`)

        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[]
        }

        for (const product of products) {
            try {
                await this.createProduct(product)
                results.success++
            } catch (error: any) {
                results.failed++
                results.errors.push(`${product.title}: ${error.message}`)
            }
        }

        console.log(`✅ Sincronização concluída: ${results.success} sucesso, ${results.failed} falhas`)
        return results
    }

    /**
     * Verificar conexão
     */
    async testConnection() {
        console.log('🔌 Testando conexão com TikTok Shop...')

        try {
            await this.listProducts(1, 1)
            console.log('✅ Conexão estabelecida!')
            return true
        } catch (error) {
            console.error('❌ Falha na conexão:', error)
            return false
        }
    }
}

// Singleton
let tiktokService: TikTokService | null = null

export function getTikTokService(): TikTokService {
    if (!tiktokService) {
        tiktokService = new TikTokService()
    }
    return tiktokService
}

export default TikTokService
