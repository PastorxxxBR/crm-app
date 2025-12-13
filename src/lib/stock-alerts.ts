/**
 * Sistema de Alertas de Estoque
 * Monitora níveis de estoque e envia notificações
 */

import { z } from 'zod'

// ============= CONFIGURAÇÃO DE ALERTAS =============

export const StockAlertConfigSchema = z.object({
    product_id: z.string(),
    product_name: z.string(),
    store_id: z.string(),
    current_stock: z.number().int().nonnegative(),
    min_stock: z.number().int().nonnegative(),
    ideal_stock: z.number().int().positive(),
    status: z.enum(['ok', 'low', 'critical', 'out']),
    last_checked: z.date(),
})

export type StockAlertConfig = z.infer<typeof StockAlertConfigSchema>

// ============= ALERTAS =============

export const StockAlertSchema = z.object({
    id: z.string(),
    product_id: z.string(),
    product_name: z.string(),
    store_id: z.string(),
    store_name: z.string(),
    current_stock: z.number(),
    min_stock: z.number(),
    severity: z.enum(['low', 'critical', 'out']),
    message: z.string(),
    created_at: z.date(),
    resolved: z.boolean().default(false),
    resolved_at: z.date().optional(),
})

export type StockAlert = z.infer<typeof StockAlertSchema>

// Mock de alertas
let alerts: StockAlert[] = []

// ============= FUNÇÕES DE MONITORAMENTO =============

export function checkStockLevel(
    productId: string,
    productName: string,
    storeId: string,
    storeName: string,
    currentStock: number,
    minStock: number
): StockAlert | null {
    let severity: 'low' | 'critical' | 'out' | null = null
    let message = ''

    if (currentStock === 0) {
        severity = 'out'
        message = `PRODUTO ESGOTADO: ${productName} na ${storeName}`
    } else if (currentStock <= Math.floor(minStock * 0.5)) {
        severity = 'critical'
        message = `ESTOQUE CRÍTICO: ${productName} na ${storeName} - Apenas ${currentStock} unidades`
    } else if (currentStock <= minStock) {
        severity = 'low'
        message = `Estoque baixo: ${productName} na ${storeName} - ${currentStock} unidades`
    }

    if (severity) {
        const alert: StockAlert = {
            id: `alert_${Date.now()}_${Math.random()}`,
            product_id: productId,
            product_name: productName,
            store_id: storeId,
            store_name: storeName,
            current_stock: currentStock,
            min_stock: minStock,
            severity,
            message,
            created_at: new Date(),
            resolved: false,
        }

        alerts.push(alert)
        return alert
    }

    return null
}

export function getAllAlerts(storeId?: string, resolved?: boolean): StockAlert[] {
    let filtered = alerts

    if (storeId) {
        filtered = filtered.filter(a => a.store_id === storeId)
    }

    if (resolved !== undefined) {
        filtered = filtered.filter(a => a.resolved === resolved)
    }

    return filtered.sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
}

export function getActiveAlerts(storeId?: string): StockAlert[] {
    return getAllAlerts(storeId, false)
}

export function resolveAlert(alertId: string): boolean {
    const alert = alerts.find(a => a.id === alertId)

    if (!alert) return false

    alert.resolved = true
    alert.resolved_at = new Date()

    return true
}

// ============= ESTATÍSTICAS =============

export interface StockAlertStats {
    total_alerts: number
    critical_alerts: number
    low_alerts: number
    out_of_stock: number
    resolved_today: number
}

export function getAlertStats(storeId?: string): StockAlertStats {
    const activeAlerts = getActiveAlerts(storeId)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const resolvedToday = alerts.filter(a =>
        a.resolved &&
        a.resolved_at &&
        a.resolved_at >= today &&
        (!storeId || a.store_id === storeId)
    )

    return {
        total_alerts: activeAlerts.length,
        critical_alerts: activeAlerts.filter(a => a.severity === 'critical').length,
        low_alerts: activeAlerts.filter(a => a.severity === 'low').length,
        out_of_stock: activeAlerts.filter(a => a.severity === 'out').length,
        resolved_today: resolvedToday.length,
    }
}

// ============= NOTIFICAÇÕES =============

export interface NotificationChannel {
    type: 'email' | 'sms' | 'whatsapp' | 'push'
    enabled: boolean
    recipients: string[]
}

export function sendAlertNotification(
    alert: StockAlert,
    channels: NotificationChannel[]
): void {
    // Mock de envio de notificações
    channels.forEach(channel => {
        if (!channel.enabled) return

        switch (channel.type) {
            case 'email':
                console.log(`📧 Email enviado para ${channel.recipients.join(', ')}`)
                console.log(`Assunto: ${alert.message}`)
                break

            case 'sms':
                console.log(`📱 SMS enviado para ${channel.recipients.join(', ')}`)
                console.log(`Mensagem: ${alert.message}`)
                break

            case 'whatsapp':
                console.log(`💬 WhatsApp enviado para ${channel.recipients.join(', ')}`)
                console.log(`Mensagem: ${alert.message}`)
                break

            case 'push':
                console.log(`🔔 Push notification enviado`)
                console.log(`Mensagem: ${alert.message}`)
                break
        }
    })
}

// ============= MOCK DE PRODUTOS COM ESTOQUE BAIXO =============

// Simular alguns alertas para demonstração
export function generateMockAlerts(): void {
    checkStockLevel('1', 'Vestido Floral', 'store_1', 'Loja Centro', 2, 10)
    checkStockLevel('2', 'Calça Jeans', 'store_2', 'Loja Shopping', 0, 15)
    checkStockLevel('3', 'Blusa Básica', 'store_1', 'Loja Centro', 5, 20)
    checkStockLevel('4', 'Saia Midi', 'store_3', 'Loja Bairro', 1, 8)
}

// Gerar alertas mock na inicialização
generateMockAlerts()
