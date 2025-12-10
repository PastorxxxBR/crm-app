import { BaseAgent } from '../base'
import { supabase } from '@/lib/supabase'

interface Product {
    id: string
    sku: string
    name: string
    stock_quantity: number
    velocity?: number // Units sold per day
    last_restock_date?: Date
    cost_price?: number
    price: number
}

interface StockAlert {
    id?: string
    product_id: string
    alert_type: 'low_stock' | 'stockout' | 'slow_mover' | 'excess'
    threshold?: number
    current_quantity: number
    suggested_action: string
    status: 'pending' | 'acknowledged' | 'resolved'
}

interface RestockSuggestion {
    product_id: string
    product_name: string
    current_stock: number
    suggested_quantity: number
    days_until_stockout: number
    confidence: number
    reasoning: string
}

export class InventoryAgent extends BaseAgent {
    constructor() {
        super('inventory')
        this.setupEventListeners()
    }

    /**
     * Setup event listeners
     */
    private setupEventListeners() {
        // Listen to stock sync events from MarketplacesAgent
        this.subscribeTo('marketplaces', 'stock_synced', async (payload) => {
            this.log(`Stock synced for ${payload.sku}, checking for alerts...`)
            await this.checkStockLevel(payload.sku)
        })
    }

    /**
     * Predict when a product will stock out
     */
    public async predictStockout(sku: string): Promise<RestockSuggestion | null> {
        try {
            // 1. Get product data
            const { data: product, error } = await supabase
                .from('products')
                .select('*')
                .eq('sku', sku)
                .single()

            if (error || !product) {
                this.log(`Product ${sku} not found`)
                return null
            }

            // 2. Calculate velocity (if not stored)
            let velocity = product.velocity
            if (!velocity) {
                velocity = await this.calculateVelocity(product.id)
            }

            // 3. Calculate days until stockout
            const daysUntilStockout = velocity > 0 ? Math.floor(product.stock_quantity / velocity) : 999

            // 4. Use AI to suggest restock quantity
            const suggestion = await this.generateRestockSuggestion(product, velocity, daysUntilStockout)

            this.log(`Stockout prediction for ${sku}: ${daysUntilStockout} days`)

            return {
                product_id: product.id,
                product_name: product.name,
                current_stock: product.stock_quantity,
                suggested_quantity: suggestion.quantity,
                days_until_stockout: daysUntilStockout,
                confidence: suggestion.confidence,
                reasoning: suggestion.reasoning
            }

        } catch (e: any) {
            this.log(`Error predicting stockout: ${e.message}`)
            return null
        }
    }

    /**
     * Calculate sales velocity (units per day)
     */
    private async calculateVelocity(productId: string): Promise<number> {
        try {
            // Query sales from last 30 days (assuming you have a sales table)
            // For now, using a mock calculation
            // TODO: Implement real sales query when sales table is ready

            const mockSalesLast30Days = Math.floor(Math.random() * 100) + 20
            const velocity = mockSalesLast30Days / 30

            // Update product velocity
            await supabase
                .from('products')
                .update({ velocity })
                .eq('id', productId)

            return velocity

        } catch (e: any) {
            this.log(`Error calculating velocity: ${e.message}`)
            return 0
        }
    }

    /**
     * Generate restock suggestion using AI
     */
    private async generateRestockSuggestion(
        product: Product,
        velocity: number,
        daysUntilStockout: number
    ): Promise<{ quantity: number; confidence: number; reasoning: string }> {
        try {
            const { GoogleGenerativeAI } = await import("@google/generative-ai")
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

            const prompt = `
            Atua como Especialista em Gestão de Estoque para loja de roupas (varejo e atacado).
            
            Produto: ${product.name} (SKU: ${product.sku})
            Estoque Atual: ${product.stock_quantity} unidades
            Velocidade de Vendas: ${velocity.toFixed(2)} unidades/dia
            Dias até Esgotar: ${daysUntilStockout} dias
            Preço de Custo: R$ ${product.cost_price || 'N/A'}
            Preço de Venda: R$ ${product.price}
            
            Tarefas:
            1. Calcular quantidade ideal de reposição considerando:
               - Lead time de fornecedor (assumir 15 dias)
               - Estoque de segurança (30 dias de vendas)
               - Sazonalidade (moda tem picos)
               - Evitar excesso (roupas têm tendências)
            
            2. Avaliar confiança da previsão (0.0 a 1.0):
               - Alta se velocidade estável
               - Baixa se produto novo ou vendas erráticas
            
            3. Explicar raciocínio em 1 frase
            
            Retorna JSON: { "quantity": number, "confidence": number, "reasoning": "string" }
            Sem markdown.
            `

            const result = await model.generateContent(prompt)
            const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim()
            const suggestion = JSON.parse(text)

            return suggestion

        } catch (e: any) {
            this.log(`Error generating restock suggestion: ${e.message}`)
            // Fallback: simple calculation
            const safetyStock = Math.ceil(velocity * 30) // 30 days
            const leadTimeStock = Math.ceil(velocity * 15) // 15 days lead time
            const quantity = Math.max(safetyStock + leadTimeStock - product.stock_quantity, 0)

            return {
                quantity,
                confidence: 0.5,
                reasoning: '[FALLBACK] Calculado estoque de segurança (30 dias) + lead time (15 dias)'
            }
        }
    }

    /**
     * Check stock level and create alerts
     */
    public async checkStockLevel(sku: string): Promise<StockAlert | null> {
        try {
            const { data: product, error } = await supabase
                .from('products')
                .select('*')
                .eq('sku', sku)
                .single()

            if (error || !product) return null

            const velocity = product.velocity || await this.calculateVelocity(product.id)
            const daysOfStock = velocity > 0 ? product.stock_quantity / velocity : 999

            let alert: StockAlert | null = null

            // Stockout
            if (product.stock_quantity === 0) {
                alert = {
                    product_id: product.id,
                    alert_type: 'stockout',
                    current_quantity: 0,
                    suggested_action: '🚨 URGENTE: Produto esgotado! Repor imediatamente.',
                    status: 'pending'
                }
            }
            // Low stock (less than 7 days)
            else if (daysOfStock < 7) {
                alert = {
                    product_id: product.id,
                    alert_type: 'low_stock',
                    threshold: Math.ceil(velocity * 7),
                    current_quantity: product.stock_quantity,
                    suggested_action: `⚠️ Estoque baixo! Restam apenas ${Math.floor(daysOfStock)} dias. Considere repor.`,
                    status: 'pending'
                }
            }
            // Slow mover (more than 90 days of stock)
            else if (daysOfStock > 90 && product.stock_quantity > 20) {
                alert = {
                    product_id: product.id,
                    alert_type: 'slow_mover',
                    current_quantity: product.stock_quantity,
                    suggested_action: `📉 Produto parado (${Math.floor(daysOfStock)} dias de estoque). Considere promoção.`,
                    status: 'pending'
                }
            }
            // Excess stock (more than 60 days)
            else if (daysOfStock > 60 && product.stock_quantity > 50) {
                alert = {
                    product_id: product.id,
                    alert_type: 'excess',
                    current_quantity: product.stock_quantity,
                    suggested_action: `📦 Excesso de estoque (${Math.floor(daysOfStock)} dias). Avaliar desconto.`,
                    status: 'pending'
                }
            }

            if (alert) {
                await this.createAlert(alert)
                await this.publishEvent('stock_alert', { ...alert, product_name: product.name })
            }

            return alert

        } catch (e: any) {
            this.log(`Error checking stock level: ${e.message}`)
            return null
        }
    }

    /**
     * Create stock alert
     */
    private async createAlert(alert: StockAlert): Promise<void> {
        try {
            // Check if alert already exists
            const { data: existing } = await supabase
                .from('inventory_alerts')
                .select('id')
                .eq('product_id', alert.product_id)
                .eq('alert_type', alert.alert_type)
                .eq('status', 'pending')
                .single()

            if (existing) {
                this.log('Alert already exists, skipping...')
                return
            }

            const { error } = await supabase
                .from('inventory_alerts')
                .insert(alert)

            if (error) throw error

            this.log(`Alert created: ${alert.alert_type} for product ${alert.product_id}`)

        } catch (e: any) {
            this.log(`Error creating alert: ${e.message}`)
        }
    }

    /**
     * Get all pending alerts
     */
    public async getPendingAlerts(): Promise<StockAlert[]> {
        try {
            const { data, error } = await supabase
                .from('inventory_alerts')
                .select(`
                    *,
                    products (
                        sku,
                        name,
                        price
                    )
                `)
                .eq('status', 'pending')
                .order('created_at', { ascending: false })

            if (error) throw error
            return data as StockAlert[]

        } catch (e: any) {
            this.log(`Error fetching alerts: ${e.message}`)
            return []
        }
    }

    /**
     * Analyze entire inventory and generate report
     */
    public async analyzeInventory(): Promise<{
        total_products: number
        low_stock_count: number
        stockout_count: number
        slow_movers_count: number
        total_value: number
        recommendations: string[]
    }> {
        try {
            const { data: products, error } = await supabase
                .from('products')
                .select('*')

            if (error || !products) throw error

            let lowStockCount = 0
            let stockoutCount = 0
            let slowMoversCount = 0
            let totalValue = 0
            const recommendations: string[] = []

            for (const product of products) {
                const velocity = product.velocity || await this.calculateVelocity(product.id)
                const daysOfStock = velocity > 0 ? product.stock_quantity / velocity : 999

                if (product.stock_quantity === 0) stockoutCount++
                else if (daysOfStock < 7) lowStockCount++
                else if (daysOfStock > 90) slowMoversCount++

                totalValue += product.stock_quantity * (product.cost_price || product.price * 0.5)

                // Check and create alerts
                await this.checkStockLevel(product.sku)
            }

            // Generate AI recommendations
            const aiRecommendations = await this.generateInventoryRecommendations({
                total_products: products.length,
                low_stock_count: lowStockCount,
                stockout_count: stockoutCount,
                slow_movers_count: slowMoversCount,
                total_value: totalValue
            })

            return {
                total_products: products.length,
                low_stock_count: lowStockCount,
                stockout_count: stockoutCount,
                slow_movers_count: slowMoversCount,
                total_value: totalValue,
                recommendations: aiRecommendations
            }

        } catch (e: any) {
            this.log(`Error analyzing inventory: ${e.message}`)
            return {
                total_products: 0,
                low_stock_count: 0,
                stockout_count: 0,
                slow_movers_count: 0,
                total_value: 0,
                recommendations: []
            }
        }
    }

    /**
     * Generate inventory recommendations with AI
     */
    private async generateInventoryRecommendations(summary: any): Promise<string[]> {
        try {
            const { GoogleGenerativeAI } = await import("@google/generative-ai")
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

            const prompt = `
            Atua como Consultor de Gestão de Estoque para loja de roupas.
            
            Resumo do Inventário:
            - Total de Produtos: ${summary.total_products}
            - Produtos com Estoque Baixo: ${summary.low_stock_count}
            - Produtos Esgotados: ${summary.stockout_count}
            - Produtos Parados (Slow Movers): ${summary.slow_movers_count}
            - Valor Total em Estoque: R$ ${summary.total_value.toFixed(2)}
            
            Gera 3 recomendações estratégicas para otimizar o estoque.
            Foca em: redução de custos, aumento de giro, evitar rupturas.
            
            Retorna JSON: { "recommendations": ["string", "string", "string"] }
            Sem markdown.
            `

            const result = await model.generateContent(prompt)
            const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim()
            const response = JSON.parse(text)

            return response.recommendations

        } catch (e: any) {
            this.log(`Error generating recommendations: ${e.message}`)
            return [
                '📊 Priorize reposição dos produtos esgotados para evitar perda de vendas',
                '💰 Considere promoções para produtos parados (slow movers) para liberar capital',
                '⚡ Implemente sistema de reposição automática para produtos de alta rotação'
            ]
        }
    }

    /**
     * Acknowledge alert
     */
    public async acknowledgeAlert(alertId: string): Promise<void> {
        try {
            await supabase
                .from('inventory_alerts')
                .update({ status: 'acknowledged' })
                .eq('id', alertId)

            this.log(`Alert ${alertId} acknowledged`)

        } catch (e: any) {
            this.log(`Error acknowledging alert: ${e.message}`)
        }
    }
}
