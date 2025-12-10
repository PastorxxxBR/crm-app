import { BaseAgent } from '../base'
import { supabase } from '@/lib/supabase'

interface LoyaltyPoints {
    customer_id: string
    points: number
    tier: 'bronze' | 'silver' | 'gold' | 'platinum'
    lifetime_points: number
}

interface Reward {
    id?: string
    name: string
    description: string
    points_required: number
    type: 'discount' | 'free_shipping' | 'free_product' | 'exclusive_access'
    value: number // Discount % or product value
    active: boolean
}

interface Transaction {
    customer_id: string
    order_id?: string
    points_earned?: number
    points_spent?: number
    description: string
}

export class LoyaltyAgent extends BaseAgent {
    // Tier thresholds
    private readonly TIER_THRESHOLDS = {
        bronze: 0,
        silver: 500,
        gold: 2000,
        platinum: 5000
    }

    // Points earning rules
    private readonly POINTS_PER_REAL = 1 // 1 ponto por R$ 1 gasto
    private readonly BIRTHDAY_BONUS = 100
    private readonly REFERRAL_BONUS = 200

    constructor() {
        super('loyalty')
    }

    /**
     * Calculate points for purchase
     */
    public calculatePointsForPurchase(orderValue: number, customerId?: string): number {
        let points = Math.floor(orderValue * this.POINTS_PER_REAL)

        // Bonus for VIP tiers (10% extra for gold, 20% for platinum)
        // TODO: Get customer tier and apply bonus

        return points
    }

    /**
     * Add points to customer
     */
    public async addPoints(transaction: Transaction): Promise<LoyaltyPoints> {
        try {
            // Get current points
            const { data: current, error: fetchError } = await supabase
                .from('loyalty_points')
                .select('*')
                .eq('customer_id', transaction.customer_id)
                .single()

            let newPoints = (current?.points || 0) + (transaction.points_earned || 0)
            let newLifetimePoints = (current?.lifetime_points || 0) + (transaction.points_earned || 0)

            // Calculate new tier
            const newTier = this.calculateTier(newLifetimePoints)

            // Check for tier upgrade
            if (current && newTier !== current.tier) {
                this.log(`🎉 Customer ${transaction.customer_id} upgraded to ${newTier.toUpperCase()}!`)
                await this.publishEvent('tier_upgraded', {
                    customer_id: transaction.customer_id,
                    old_tier: current.tier,
                    new_tier: newTier
                })

                // Send congratulations email
                await this.sendTierUpgradeEmail(transaction.customer_id, newTier)
            }

            // Upsert loyalty points
            const { data, error } = await supabase
                .from('loyalty_points')
                .upsert({
                    customer_id: transaction.customer_id,
                    points: newPoints,
                    tier: newTier,
                    lifetime_points: newLifetimePoints,
                    updated_at: new Date()
                })
                .select()
                .single()

            if (error) throw error

            // Log transaction
            await this.logTransaction(transaction)

            this.log(`Added ${transaction.points_earned} points to customer ${transaction.customer_id}`)

            return data as LoyaltyPoints

        } catch (e: any) {
            this.log(`Error adding points: ${e.message}`)
            throw e
        }
    }

    /**
     * Redeem points for reward
     */
    public async redeemPoints(customerId: string, rewardId: string): Promise<{ success: boolean; coupon_code?: string }> {
        try {
            // Get customer points
            const { data: loyalty, error: loyaltyError } = await supabase
                .from('loyalty_points')
                .select('*')
                .eq('customer_id', customerId)
                .single()

            if (loyaltyError || !loyalty) throw new Error('Customer not found in loyalty program')

            // Get reward
            const { data: reward, error: rewardError } = await supabase
                .from('loyalty_rewards')
                .select('*')
                .eq('id', rewardId)
                .single()

            if (rewardError || !reward) throw new Error('Reward not found')

            // Check if customer has enough points
            if (loyalty.points < reward.points_required) {
                throw new Error(`Insufficient points. Need ${reward.points_required}, have ${loyalty.points}`)
            }

            // Deduct points
            const newPoints = loyalty.points - reward.points_required

            await supabase
                .from('loyalty_points')
                .update({ points: newPoints, updated_at: new Date() })
                .eq('customer_id', customerId)

            // Log transaction
            await this.logTransaction({
                customer_id: customerId,
                points_spent: reward.points_required,
                description: `Redeemed: ${reward.name}`
            })

            // Generate coupon code
            const couponCode = this.generateCouponCode(reward.type, reward.value)

            this.log(`Customer ${customerId} redeemed ${reward.name} for ${reward.points_required} points`)
            await this.publishEvent('points_redeemed', { customerId, rewardId, couponCode })

            return { success: true, coupon_code: couponCode }

        } catch (e: any) {
            this.log(`Error redeeming points: ${e.message}`)
            return { success: false }
        }
    }

    /**
     * Calculate tier based on lifetime points
     */
    private calculateTier(lifetimePoints: number): LoyaltyPoints['tier'] {
        if (lifetimePoints >= this.TIER_THRESHOLDS.platinum) return 'platinum'
        if (lifetimePoints >= this.TIER_THRESHOLDS.gold) return 'gold'
        if (lifetimePoints >= this.TIER_THRESHOLDS.silver) return 'silver'
        return 'bronze'
    }

    /**
     * Get customer loyalty status
     */
    public async getCustomerStatus(customerId: string): Promise<LoyaltyPoints & { next_tier?: string; points_to_next_tier?: number }> {
        try {
            const { data, error } = await supabase
                .from('loyalty_points')
                .select('*')
                .eq('customer_id', customerId)
                .single()

            if (error) {
                // Customer not in program yet, create entry
                const newEntry = {
                    customer_id: customerId,
                    points: 0,
                    tier: 'bronze' as const,
                    lifetime_points: 0
                }

                await supabase.from('loyalty_points').insert(newEntry)
                return { ...newEntry, next_tier: 'silver', points_to_next_tier: 500 }
            }

            const loyalty = data as LoyaltyPoints

            // Calculate next tier
            const tiers: Array<LoyaltyPoints['tier']> = ['bronze', 'silver', 'gold', 'platinum']
            const currentIndex = tiers.indexOf(loyalty.tier)
            const nextTier = currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : undefined
            const pointsToNextTier = nextTier ? this.TIER_THRESHOLDS[nextTier] - loyalty.lifetime_points : undefined

            return {
                ...loyalty,
                next_tier: nextTier,
                points_to_next_tier: pointsToNextTier
            }

        } catch (e: any) {
            this.log(`Error getting customer status: ${e.message}`)
            throw e
        }
    }

    /**
     * Get available rewards for customer
     */
    public async getAvailableRewards(customerId: string): Promise<Reward[]> {
        try {
            const status = await this.getCustomerStatus(customerId)

            const { data, error } = await supabase
                .from('loyalty_rewards')
                .select('*')
                .eq('active', true)
                .lte('points_required', status.points)
                .order('points_required', { ascending: true })

            if (error) throw error
            return data as Reward[]

        } catch (e: any) {
            this.log(`Error getting rewards: ${e.message}`)
            return []
        }
    }

    /**
     * Identify customers at risk of churn
     */
    public async identifyChurnRisk(): Promise<Array<{ customer_id: string; risk_score: number; reason: string }>> {
        try {
            // Get customers with no purchase in last 60 days
            const sixtyDaysAgo = new Date()
            sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

            const { data: inactiveCustomers, error } = await supabase
                .from('profiles')
                .select('id, email, last_purchase_date, total_spent')
                .lt('last_purchase_date', sixtyDaysAgo.toISOString())
                .gte('total_spent', 100) // Only customers who spent before

            if (error) throw error

            const atRisk = (inactiveCustomers || []).map(customer => {
                const daysSinceLastPurchase = Math.floor(
                    (new Date().getTime() - new Date(customer.last_purchase_date).getTime()) / (1000 * 60 * 60 * 24)
                )

                let riskScore = 0
                let reason = ''

                if (daysSinceLastPurchase > 90) {
                    riskScore = 0.8
                    reason = `Inativo há ${daysSinceLastPurchase} dias (alto risco)`
                } else if (daysSinceLastPurchase > 60) {
                    riskScore = 0.5
                    reason = `Inativo há ${daysSinceLastPurchase} dias (médio risco)`
                }

                return {
                    customer_id: customer.id,
                    risk_score: riskScore,
                    reason
                }
            })

            this.log(`Identified ${atRisk.length} customers at risk of churn`)
            return atRisk

        } catch (e: any) {
            this.log(`Error identifying churn risk: ${e.message}`)
            return []
        }
    }

    /**
     * Send reactivation campaign
     */
    public async sendReactivationCampaign(): Promise<number> {
        try {
            const atRisk = await this.identifyChurnRisk()

            let sent = 0

            for (const customer of atRisk) {
                // Give bonus points to incentivize return
                await this.addPoints({
                    customer_id: customer.customer_id,
                    points_earned: 100,
                    description: 'Bonus de reativação - Sentimos sua falta!'
                })

                // TODO: Send reactivation email via EmailMarketingAgent
                sent++
            }

            this.log(`Sent reactivation campaign to ${sent} customers`)
            await this.publishEvent('reactivation_campaign_sent', { count: sent })

            return sent

        } catch (e: any) {
            this.log(`Error sending reactivation campaign: ${e.message}`)
            return 0
        }
    }

    /**
     * Birthday bonus
     */
    public async grantBirthdayBonus(customerId: string): Promise<void> {
        try {
            await this.addPoints({
                customer_id: customerId,
                points_earned: this.BIRTHDAY_BONUS,
                description: '🎂 Feliz Aniversário! Bônus especial'
            })

            this.log(`Birthday bonus granted to ${customerId}`)

        } catch (e: any) {
            this.log(`Error granting birthday bonus: ${e.message}`)
        }
    }

    /**
     * Referral bonus
     */
    public async grantReferralBonus(referrerId: string, referredId: string): Promise<void> {
        try {
            // Give points to both referrer and referred
            await this.addPoints({
                customer_id: referrerId,
                points_earned: this.REFERRAL_BONUS,
                description: '🎁 Bônus por indicação de amigo'
            })

            await this.addPoints({
                customer_id: referredId,
                points_earned: this.REFERRAL_BONUS,
                description: '🎁 Bônus de boas-vindas por indicação'
            })

            this.log(`Referral bonus granted: ${referrerId} → ${referredId}`)

        } catch (e: any) {
            this.log(`Error granting referral bonus: ${e.message}`)
        }
    }

    /**
     * Log loyalty transaction
     */
    private async logTransaction(transaction: Transaction): Promise<void> {
        try {
            await supabase.from('loyalty_transactions').insert({
                customer_id: transaction.customer_id,
                order_id: transaction.order_id,
                points_earned: transaction.points_earned || 0,
                points_spent: transaction.points_spent || 0,
                description: transaction.description,
                created_at: new Date()
            })
        } catch (e: any) {
            this.log(`Error logging transaction: ${e.message}`)
        }
    }

    /**
     * Generate coupon code
     */
    private generateCouponCode(type: Reward['type'], value: number): string {
        const prefix = type === 'discount' ? 'DESC' : type === 'free_shipping' ? 'FRETE' : 'PREMIO'
        const random = Math.random().toString(36).substring(2, 8).toUpperCase()
        return `${prefix}${value}${random}`
    }

    /**
     * Send tier upgrade email
     */
    private async sendTierUpgradeEmail(customerId: string, newTier: string): Promise<void> {
        try {
            // TODO: Integrate with EmailMarketingAgent
            this.log(`Tier upgrade email queued for ${customerId} (${newTier})`)
        } catch (e: any) {
            this.log(`Error sending tier upgrade email: ${e.message}`)
        }
    }

    /**
     * Get tier benefits
     */
    public getTierBenefits(tier: LoyaltyPoints['tier']): string[] {
        const benefits = {
            bronze: [
                '✅ 1 ponto por R$ 1 gasto',
                '🎂 Bônus de aniversário (100 pontos)',
                '🎁 Bônus de indicação (200 pontos)'
            ],
            silver: [
                '✅ 1 ponto por R$ 1 gasto',
                '🎂 Bônus de aniversário (150 pontos)',
                '🎁 Bônus de indicação (250 pontos)',
                '📦 Frete grátis em compras acima de R$ 100',
                '⚡ Acesso antecipado a promoções'
            ],
            gold: [
                '✅ 1.1 pontos por R$ 1 gasto (+10% bonus)',
                '🎂 Bônus de aniversário (200 pontos)',
                '🎁 Bônus de indicação (300 pontos)',
                '📦 Frete grátis em todas as compras',
                '⚡ Acesso antecipado a lançamentos',
                '👔 Atendimento prioritário'
            ],
            platinum: [
                '✅ 1.2 pontos por R$ 1 gasto (+20% bonus)',
                '🎂 Bônus de aniversário (300 pontos)',
                '🎁 Bônus de indicação (400 pontos)',
                '📦 Frete grátis + embalagem premium',
                '⚡ Acesso exclusivo a coleções limitadas',
                '👔 Atendimento VIP dedicado',
                '🎁 Brindes exclusivos',
                '💎 Descontos especiais em atacado'
            ]
        }

        return benefits[tier]
    }
}
