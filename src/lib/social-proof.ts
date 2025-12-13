/**
 * Sistema de Provas Sociais e Urgência
 * Aumenta conversão com gatilhos psicológicos
 */

import { z } from 'zod'

// ============= PROVAS SOCIAIS =============

export const ReviewSchema = z.object({
    id: z.string(),
    product_id: z.string(),
    customer_name: z.string(),
    rating: z.number().min(1).max(5),
    comment: z.string(),
    verified_purchase: z.boolean().default(false),
    helpful_count: z.number().int().nonnegative().default(0),
    created_at: z.date(),
    images: z.array(z.string().url()).optional(),
})

export type Review = z.infer<typeof ReviewSchema>

/**
 * Calcular média de avaliações
 */
export function calculateAverageRating(reviews: Review[]): {
    average: number
    total: number
    distribution: Record<number, number>
} {
    if (reviews.length === 0) {
        return { average: 0, total: 0, distribution: {} }
    }

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
    const average = sum / reviews.length

    const distribution: Record<number, number> = {
        5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    }

    reviews.forEach(r => {
        distribution[r.rating]++
    })

    return { average, total: reviews.length, distribution }
}

/**
 * Gerar HTML de estrelas
 */
export function generateStarsHTML(rating: number): string {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    return `
        ${'⭐'.repeat(fullStars)}${hasHalfStar ? '⭐' : ''}${'☆'.repeat(emptyStars)}
    `.trim()
}

// ============= CONTADOR DE VENDAS =============

export interface SalesCounter {
    product_id: string
    total_sales: number
    sales_today: number
    sales_this_week: number
    last_sale_at: Date
}

/**
 * Gerar mensagem de vendas
 */
export function generateSalesMessage(counter: SalesCounter): string {
    if (counter.sales_today > 0) {
        return `🔥 ${counter.sales_today} pessoas compraram hoje!`
    }

    if (counter.sales_this_week > 0) {
        return `✅ ${counter.sales_this_week} vendidos esta semana`
    }

    if (counter.total_sales > 100) {
        return `⭐ Mais de ${counter.total_sales} vendidos`
    }

    return ''
}

// ============= INDICADOR DE ESTOQUE =============

export interface StockIndicator {
    product_id: string
    current_stock: number
    low_stock_threshold: number
    show_exact_count: boolean
}

/**
 * Gerar mensagem de estoque
 */
export function generateStockMessage(indicator: StockIndicator): {
    message: string
    urgency: 'high' | 'medium' | 'low' | 'none'
    color: string
} {
    const { current_stock, low_stock_threshold, show_exact_count } = indicator

    if (current_stock === 0) {
        return {
            message: '❌ Produto esgotado',
            urgency: 'none',
            color: 'red'
        }
    }

    if (current_stock <= 3) {
        return {
            message: show_exact_count
                ? `⚠️ Apenas ${current_stock} unidades restantes!`
                : '⚠️ Últimas unidades!',
            urgency: 'high',
            color: 'red'
        }
    }

    if (current_stock <= low_stock_threshold) {
        return {
            message: show_exact_count
                ? `⚠️ ${current_stock} unidades em estoque`
                : '⚠️ Estoque limitado',
            urgency: 'medium',
            color: 'orange'
        }
    }

    return {
        message: '✅ Em estoque',
        urgency: 'low',
        color: 'green'
    }
}

// ============= CONTADOR DE TEMPO =============

export interface CountdownTimer {
    end_date: Date
    label: string
    type: 'flash_sale' | 'limited_offer' | 'pre_order' | 'custom'
}

/**
 * Calcular tempo restante
 */
export function calculateTimeRemaining(endDate: Date): {
    days: number
    hours: number
    minutes: number
    seconds: number
    isExpired: boolean
} {
    const now = new Date()
    const diff = endDate.getTime() - now.getTime()

    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return { days, hours, minutes, seconds, isExpired: false }
}

/**
 * Formatar tempo restante
 */
export function formatTimeRemaining(time: ReturnType<typeof calculateTimeRemaining>): string {
    if (time.isExpired) {
        return 'Oferta encerrada'
    }

    if (time.days > 0) {
        return `${time.days}d ${time.hours}h ${time.minutes}m`
    }

    if (time.hours > 0) {
        return `${time.hours}h ${time.minutes}m ${time.seconds}s`
    }

    return `${time.minutes}m ${time.seconds}s`
}

// ============= PESSOAS VENDO AGORA =============

/**
 * Gerar número de pessoas vendo (simulado com base em popularidade)
 */
export function generateViewersCount(
    totalViews: number,
    salesCount: number
): number {
    // Algoritmo simples: base + fator de popularidade
    const base = Math.floor(Math.random() * 5) + 3 // 3-8 pessoas base
    const popularity = Math.floor((totalViews / 100) + (salesCount / 10))

    return Math.min(base + popularity, 50) // Máximo 50 pessoas
}

/**
 * Gerar mensagem de visualizações
 */
export function generateViewersMessage(count: number): string {
    if (count === 1) {
        return '👁️ 1 pessoa vendo agora'
    }

    return `👁️ ${count} pessoas vendo agora`
}

// ============= COMPONENTE COMPLETO =============

export interface ProductUrgencyData {
    // Provas sociais
    reviews: Review[]
    sales_counter: SalesCounter

    // Estoque
    stock: StockIndicator

    // Urgência
    countdown?: CountdownTimer
    viewers_count?: number
}

/**
 * Gerar todos os badges de urgência/prova social
 */
export function generateUrgencyBadges(data: ProductUrgencyData): {
    rating: string
    sales: string
    stock: string
    countdown?: string
    viewers?: string
} {
    const { average, total } = calculateAverageRating(data.reviews)

    return {
        rating: total > 0
            ? `${generateStarsHTML(average)} ${average.toFixed(1)} (${total} avaliações)`
            : '',
        sales: generateSalesMessage(data.sales_counter),
        stock: generateStockMessage(data.stock).message,
        countdown: data.countdown
            ? `⏰ ${formatTimeRemaining(calculateTimeRemaining(data.countdown.end_date))}`
            : undefined,
        viewers: data.viewers_count
            ? generateViewersMessage(data.viewers_count)
            : undefined
    }
}

/**
 * Gerar HTML completo de urgência
 */
export function generateUrgencyHTML(data: ProductUrgencyData): string {
    const badges = generateUrgencyBadges(data)
    const stockInfo = generateStockMessage(data.stock)

    return `
<div class="urgency-container">
    ${badges.rating ? `
    <div class="badge rating">
        ${badges.rating}
    </div>
    ` : ''}
    
    ${badges.sales ? `
    <div class="badge sales">
        ${badges.sales}
    </div>
    ` : ''}
    
    ${badges.stock ? `
    <div class="badge stock ${stockInfo.urgency}">
        ${badges.stock}
    </div>
    ` : ''}
    
    ${badges.countdown ? `
    <div class="badge countdown high">
        ${badges.countdown}
    </div>
    ` : ''}
    
    ${badges.viewers ? `
    <div class="badge viewers">
        ${badges.viewers}
    </div>
    ` : ''}
</div>

<style>
.urgency-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 16px 0;
}

.badge {
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
}

.badge.rating {
    background: #fef3c7;
    color: #92400e;
}

.badge.sales {
    background: #dbeafe;
    color: #1e40af;
}

.badge.stock.high {
    background: #fee2e2;
    color: #991b1b;
    animation: pulse 2s infinite;
}

.badge.stock.medium {
    background: #fed7aa;
    color: #9a3412;
}

.badge.stock.low {
    background: #d1fae5;
    color: #065f46;
}

.badge.countdown.high {
    background: #fecaca;
    color: #991b1b;
    animation: pulse 2s infinite;
}

.badge.viewers {
    background: #e0e7ff;
    color: #3730a3;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}
</style>
`.trim()
}
