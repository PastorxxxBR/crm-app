/**
 * Sistema de Configuração de Taxas de Pagamento
 * Suporta múltiplas bandeiras e formas de pagamento
 */

import { z } from 'zod'

// Tipos de pagamento
export type PaymentMethod = 'credit' | 'debit' | 'pix' | 'cash'

// Bandeiras de cartão
export type CardBrand =
    | 'visa'
    | 'mastercard'
    | 'elo'
    | 'amex'
    | 'hipercard'
    | 'diners'
    | 'discover'
    | 'other'

// Schema de configuração de taxa
export const PaymentFeeConfigSchema = z.object({
    id: z.string().optional(),
    store_id: z.string(),
    payment_method: z.enum(['credit', 'debit', 'pix', 'cash']),
    card_brand: z.enum(['visa', 'mastercard', 'elo', 'amex', 'hipercard', 'diners', 'discover', 'other']).optional(),

    // Taxas
    fee_percentage: z.number().min(0).max(100), // % (ex: 2.5 = 2.5%)
    fee_fixed: z.number().min(0), // Valor fixo (ex: 0.50)

    // Parcelamento (apenas crédito)
    max_installments: z.number().int().min(1).max(12).optional(),
    installment_fee_percentage: z.number().min(0).max(100).optional(), // Taxa adicional por parcela

    // Metadata
    active: z.boolean().default(true),
    created_at: z.date().optional(),
    updated_at: z.date().optional(),
})

export type PaymentFeeConfig = z.infer<typeof PaymentFeeConfigSchema>

// Schema de cálculo de taxa
export const FeeCalculationSchema = z.object({
    amount: z.number().positive(),
    payment_method: z.enum(['credit', 'debit', 'pix', 'cash']),
    card_brand: z.enum(['visa', 'mastercard', 'elo', 'amex', 'hipercard', 'diners', 'discover', 'other']).optional(),
    installments: z.number().int().min(1).max(12).optional(),
})

export type FeeCalculation = z.infer<typeof FeeCalculationSchema>

// Resultado do cálculo
export interface FeeCalculationResult {
    gross_amount: number          // Valor bruto
    fee_percentage_amount: number // Taxa percentual
    fee_fixed_amount: number      // Taxa fixa
    installment_fee_amount: number // Taxa de parcelamento
    total_fee: number             // Taxa total
    net_amount: number            // Valor líquido
    installment_value?: number    // Valor da parcela (se parcelado)
}

/**
 * Classe para gerenciar taxas de pagamento
 */
export class PaymentFeeManager {
    private configs: Map<string, PaymentFeeConfig> = new Map()

    /**
     * Adicionar configuração de taxa
     */
    addConfig(config: PaymentFeeConfig): void {
        const key = this.getConfigKey(
            config.payment_method,
            config.card_brand
        )
        this.configs.set(key, config)
    }

    /**
     * Buscar configuração
     */
    getConfig(
        payment_method: PaymentMethod,
        card_brand?: CardBrand
    ): PaymentFeeConfig | null {
        const key = this.getConfigKey(payment_method, card_brand)
        return this.configs.get(key) || null
    }

    /**
     * Calcular taxa
     */
    calculateFee(
        calculation: FeeCalculation
    ): FeeCalculationResult {
        const config = this.getConfig(
            calculation.payment_method,
            calculation.card_brand
        )

        if (!config) {
            throw new Error('Configuração de taxa não encontrada')
        }

        const { amount, installments = 1 } = calculation

        // Taxa percentual
        const fee_percentage_amount = amount * (config.fee_percentage / 100)

        // Taxa fixa
        const fee_fixed_amount = config.fee_fixed

        // Taxa de parcelamento
        let installment_fee_amount = 0
        if (installments > 1 && config.installment_fee_percentage) {
            installment_fee_amount = amount * (config.installment_fee_percentage / 100) * (installments - 1)
        }

        // Total de taxas
        const total_fee = fee_percentage_amount + fee_fixed_amount + installment_fee_amount

        // Valor líquido
        const net_amount = amount - total_fee

        // Valor da parcela
        const installment_value = installments > 1 ? amount / installments : undefined

        return {
            gross_amount: amount,
            fee_percentage_amount,
            fee_fixed_amount,
            installment_fee_amount,
            total_fee,
            net_amount,
            installment_value
        }
    }

    /**
     * Gerar chave de configuração
     */
    private getConfigKey(
        payment_method: PaymentMethod,
        card_brand?: CardBrand
    ): string {
        if (card_brand) {
            return `${payment_method}_${card_brand}`
        }
        return payment_method
    }

    /**
     * Listar todas as configurações
     */
    getAllConfigs(): PaymentFeeConfig[] {
        return Array.from(this.configs.values())
    }

    /**
     * Remover configuração
     */
    removeConfig(payment_method: PaymentMethod, card_brand?: CardBrand): void {
        const key = this.getConfigKey(payment_method, card_brand)
        this.configs.delete(key)
    }
}

/**
 * Configurações padrão (exemplo)
 */
export const DEFAULT_FEE_CONFIGS: Omit<PaymentFeeConfig, 'id' | 'store_id'>[] = [
    // PIX
    {
        payment_method: 'pix',
        fee_percentage: 0,
        fee_fixed: 0,
        active: true,
    },

    // Dinheiro
    {
        payment_method: 'cash',
        fee_percentage: 0,
        fee_fixed: 0,
        active: true,
    },

    // Débito - Visa
    {
        payment_method: 'debit',
        card_brand: 'visa',
        fee_percentage: 1.5,
        fee_fixed: 0,
        active: true,
    },

    // Débito - Mastercard
    {
        payment_method: 'debit',
        card_brand: 'mastercard',
        fee_percentage: 1.5,
        fee_fixed: 0,
        active: true,
    },

    // Débito - Elo
    {
        payment_method: 'debit',
        card_brand: 'elo',
        fee_percentage: 1.5,
        fee_fixed: 0,
        active: true,
    },

    // Crédito - Visa
    {
        payment_method: 'credit',
        card_brand: 'visa',
        fee_percentage: 2.5,
        fee_fixed: 0.50,
        max_installments: 12,
        installment_fee_percentage: 0.5,
        active: true,
    },

    // Crédito - Mastercard
    {
        payment_method: 'credit',
        card_brand: 'mastercard',
        fee_percentage: 2.5,
        fee_fixed: 0.50,
        max_installments: 12,
        installment_fee_percentage: 0.5,
        active: true,
    },

    // Crédito - Elo
    {
        payment_method: 'credit',
        card_brand: 'elo',
        fee_percentage: 2.7,
        fee_fixed: 0.50,
        max_installments: 12,
        installment_fee_percentage: 0.5,
        active: true,
    },

    // Crédito - Amex
    {
        payment_method: 'credit',
        card_brand: 'amex',
        fee_percentage: 3.5,
        fee_fixed: 0.50,
        max_installments: 12,
        installment_fee_percentage: 0.7,
        active: true,
    },
]

// Singleton
let feeManager: PaymentFeeManager | null = null

export function getPaymentFeeManager(): PaymentFeeManager {
    if (!feeManager) {
        feeManager = new PaymentFeeManager()

        // Carregar configurações padrão
        DEFAULT_FEE_CONFIGS.forEach(config => {
            feeManager!.addConfig({
                ...config,
                id: crypto.randomUUID(),
                store_id: 'default',
            } as PaymentFeeConfig)
        })
    }

    return feeManager
}

export default PaymentFeeManager
