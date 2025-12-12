/**
 * Cliente Meta Graph API para integração com Ads, Instagram e WhatsApp
 */

export interface MetaAdCampaign {
    id: string
    name: string
    status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED'
    objective: string
    daily_budget?: string
    lifetime_budget?: string
    start_time?: string
    stop_time?: string
}

export interface MetaAdInsights {
    impressions: number
    clicks: number
    spend: string
    reach: number
    ctr: number
    cpm: number
    cpc: number
    conversions?: number
    date_start: string
    date_stop: string
}

export interface InstagramInsights {
    followers_count: number
    media_count: number
    impressions: number
    reach: number
    profile_views: number
    website_clicks: number
}

export interface WhatsAppMessage {
    id: string
    from: string
    to: string
    timestamp: string
    type: 'text' | 'image' | 'video' | 'document'
    text?: string
    status: 'sent' | 'delivered' | 'read' | 'failed'
}

export class MetaAPIClient {
    private accessToken: string
    private apiVersion: string = 'v18.0'
    private baseUrl: string = 'https://graph.facebook.com'

    constructor(accessToken: string) {
        this.accessToken = accessToken
    }

    /**
     * Requisição genérica à Graph API
     */
    private async request(endpoint: string, params: Record<string, any> = {}): Promise<any> {
        const url = new URL(`${this.baseUrl}/${this.apiVersion}/${endpoint}`)
        url.searchParams.append('access_token', this.accessToken)

        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, String(value))
        })

        const response = await fetch(url.toString())

        if (!response.ok) {
            const error = await response.json()
            throw new Error(`Meta API Error: ${error.error?.message || 'Unknown error'}`)
        }

        return response.json()
    }

    // ==================== META ADS ====================

    /**
     * Lista todas as campanhas da conta de anúncios
     */
    async getAdCampaigns(adAccountId: string): Promise<MetaAdCampaign[]> {
        const data = await this.request(`${adAccountId}/campaigns`, {
            fields: 'name,status,objective,daily_budget,lifetime_budget,start_time,stop_time',
        })
        return data.data || []
    }

    /**
     * Obtém insights de uma campanha
     */
    async getCampaignInsights(
        campaignId: string,
        datePreset: 'today' | 'yesterday' | 'last_7d' | 'last_30d' = 'last_7d'
    ): Promise<MetaAdInsights> {
        const data = await this.request(`${campaignId}/insights`, {
            fields: 'impressions,clicks,spend,reach,ctr,cpm,cpc,actions',
            date_preset: datePreset,
        })

        const insights = data.data?.[0]
        if (!insights) {
            throw new Error('No insights available')
        }

        return {
            impressions: parseInt(insights.impressions || '0'),
            clicks: parseInt(insights.clicks || '0'),
            spend: insights.spend || '0',
            reach: parseInt(insights.reach || '0'),
            ctr: parseFloat(insights.ctr || '0'),
            cpm: parseFloat(insights.cpm || '0'),
            cpc: parseFloat(insights.cpc || '0'),
            conversions: this.extractConversions(insights.actions),
            date_start: insights.date_start,
            date_stop: insights.date_stop,
        }
    }

    /**
     * Obtém insights consolidados da conta
     */
    async getAdAccountInsights(
        adAccountId: string,
        datePreset: 'today' | 'yesterday' | 'last_7d' | 'last_30d' = 'last_30d'
    ): Promise<MetaAdInsights> {
        const data = await this.request(`${adAccountId}/insights`, {
            fields: 'impressions,clicks,spend,reach,ctr,cpm,cpc,actions',
            date_preset: datePreset,
        })

        const insights = data.data?.[0] || {}
        return {
            impressions: parseInt(insights.impressions || '0'),
            clicks: parseInt(insights.clicks || '0'),
            spend: insights.spend || '0',
            reach: parseInt(insights.reach || '0'),
            ctr: parseFloat(insights.ctr || '0'),
            cpm: parseFloat(insights.cpm || '0'),
            cpc: parseFloat(insights.cpc || '0'),
            conversions: this.extractConversions(insights.actions),
            date_start: insights.date_start,
            date_stop: insights.date_stop,
        }
    }

    private extractConversions(actions?: any[]): number {
        if (!actions) return 0
        const conversion = actions.find(a => a.action_type === 'offsite_conversion.fb_pixel_purchase')
        return parseInt(conversion?.value || '0')
    }

    // ==================== INSTAGRAM ====================

    /**
     * Obtém informações e insights do perfil Instagram
     */
    async getInstagramInsights(instagramBusinessId: string): Promise<InstagramInsights> {
        // Obter dados básicos do perfil
        const profile = await this.request(instagramBusinessId, {
            fields: 'followers_count,media_count,biography,username',
        })

        // Obter insights (últimos 30 dias)
        const insights = await this.request(`${instagramBusinessId}/insights`, {
            metric: 'impressions,reach,profile_views,website_clicks',
            period: 'day',
            since: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60,
            until: Math.floor(Date.now() / 1000),
        })

        const metricsMap = new Map()
        insights.data?.forEach((metric: any) => {
            const total = metric.values?.reduce((sum: number, v: any) => sum + (v.value || 0), 0) || 0
            metricsMap.set(metric.name, total)
        })

        return {
            followers_count: profile.followers_count || 0,
            media_count: profile.media_count || 0,
            impressions: metricsMap.get('impressions') || 0,
            reach: metricsMap.get('reach') || 0,
            profile_views: metricsMap.get('profile_views') || 0,
            website_clicks: metricsMap.get('website_clicks') || 0,
        }
    }

    /**
     * Lista posts recentes do Instagram
     */
    async getInstagramMedia(instagramBusinessId: string, limit: number = 10) {
        const data = await this.request(`${instagramBusinessId}/media`, {
            fields: 'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count',
            limit,
        })
        return data.data || []
    }

    // ==================== WHATSAPP ====================

    /**
     * Envia mensagem via WhatsApp Business
     */
    async sendWhatsAppMessage(
        phoneNumberId: string,
        to: string,
        message: string
    ): Promise<{ id: string }> {
        const url = `${this.baseUrl}/${this.apiVersion}/${phoneNumberId}/messages`

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to,
                type: 'text',
                text: { body: message },
            }),
        })

        if (!response.ok) {
            throw new Error('Failed to send WhatsApp message')
        }

        const data = await response.json()
        return { id: data.messages[0].id }
    }

    /**
     * Lista templates de mensagem aprovados
     */
    async getWhatsAppTemplates(businessId: string) {
        const data = await this.request(`${businessId}/message_templates`, {
            fields: 'name,status,language,category,components',
        })
        return data.data || []
    }

    /**
     * Obtém analytics do WhatsApp Business
     */
    async getWhatsAppAnalytics(phoneNumberId: string) {
        const data = await this.request(`${phoneNumberId}/analytics`, {
            granularity: 'day',
            start: Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60,
            end: Math.floor(Date.now() / 1000),
        })
        return data
    }

    // ==================== UTILITÁRIOS ====================

    /**
     * Verifica se o token é válido
     */
    async validateToken(): Promise<boolean> {
        try {
            await this.request('me', { fields: 'id,name' })
            return true
        } catch {
            return false
        }
    }

    /**
     * Obtém informações do usuário autenticado
     */
    async getMe() {
        return this.request('me', {
            fields: 'id,name,email',
        })
    }
}

/**
 * Cria instância do cliente Meta API
 */
export function createMetaClient(): MetaAPIClient | null {
    const token = process.env.META_ACCESS_TOKEN
    if (!token) {
        console.warn('META_ACCESS_TOKEN não configurado')
        return null
    }
    return new MetaAPIClient(token)
}
