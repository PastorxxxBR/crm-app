import { NextResponse } from 'next/server'
import { createMetaClient } from '@/lib/metaClient'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const period = (searchParams.get('period') || 'last_30d') as any

    const client = createMetaClient()

    // Se não tiver cliente configurado ou der erro, retornar dados de exemplo
    if (!client) {
        return NextResponse.json(getMockData(period))
    }

    try {
        const adAccountId = process.env.META_AD_ACCOUNT_ID
        if (!adAccountId) {
            return NextResponse.json(getMockData(period))
        }

        // Tentar buscar dados reais
        const [campaigns, accountInsights] = await Promise.all([
            client.getAdCampaigns(adAccountId),
            client.getAdAccountInsights(adAccountId, period),
        ])

        // Buscar insights de cada campanha ativa
        const campaignsWithInsights = await Promise.all(
            campaigns
                .filter(c => c.status === 'ACTIVE')
                .slice(0, 5)
                .map(async (campaign) => {
                    try {
                        const insights = await client.getCampaignInsights(campaign.id, period)
                        return { ...campaign, insights }
                    } catch (error) {
                        return { ...campaign, insights: null }
                    }
                })
        )

        return NextResponse.json({
            success: true,
            summary: accountInsights,
            campaigns: campaignsWithInsights,
            totalCampaigns: campaigns.length,
            activeCampaigns: campaigns.filter(c => c.status === 'ACTIVE').length,
            dataSource: 'real',
        })
    } catch (error: any) {
        console.warn('Erro Meta Ads API, usando dados de exemplo:', error.message)
        // Se der erro, retornar dados de exemplo
        return NextResponse.json(getMockData(period))
    }
}

// Dados de exemplo realistas para a Toca da Onça
function getMockData(period: string) {
    const multiplier = period === 'today' ? 0.1 : period === 'last_7d' ? 0.5 : 1

    return {
        success: true,
        summary: {
            spend: (1247.50 * multiplier).toFixed(2),
            reach: Math.floor(45230 * multiplier),
            impressions: Math.floor(125890 * multiplier),
            clicks: Math.floor(3847 * multiplier),
            ctr: 3.05,
            cpm: 27.54,
            cpc: 0.32,
            conversions: Math.floor(89 * multiplier),
            date_start: getDateStart(period),
            date_stop: 'today',
        },
        campaigns: [
            {
                id: 'mock_1',
                name: 'Black Friday 2025 - Vestidos',
                status: 'ACTIVE',
                objective: 'CONVERSIONS',
                daily_budget: '5000', // R$ 50,00/dia
                insights: {
                    impressions: Math.floor(45200 * multiplier),
                    clicks: Math.floor(1380 * multiplier),
                    spend: (421.30 * multiplier).toFixed(2),
                    reach: Math.floor(18900 * multiplier),
                    ctr: 3.05,
                    cpm: 22.30,
                    cpc: 0.31,
                    conversions: Math.floor(34 * multiplier),
                    date_start: getDateStart(period),
                    date_stop: 'today',
                }
            },
            {
                id: 'mock_2',
                name: 'Coleção Verão - Feminino',
                status: 'ACTIVE',
                objective: 'TRAFFIC',
                daily_budget: '3500', // R$ 35,00/dia
                insights: {
                    impressions: Math.floor(38450 * multiplier),
                    clicks: Math.floor(1150 * multiplier),
                    spend: (358.20 * multiplier).toFixed(2),
                    reach: Math.floor(15200 * multiplier),
                    ctr: 2.99,
                    cpm: 23.57,
                    cpc: 0.31,
                    conversions: Math.floor(27 * multiplier),
                    date_start: getDateStart(period),
                    date_stop: 'today',
                }
            },
            {
                id: 'mock_3',
                name: 'Acessórios Premium',
                status: 'ACTIVE',
                objective: 'CONVERSIONS',
                daily_budget: '2000', // R$ 20,00/dia
                insights: {
                    impressions: Math.floor(28340 * multiplier),
                    clicks: Math.floor(852 * multiplier),
                    spend: (298.70 * multiplier).toFixed(2),
                    reach: Math.floor(9830 * multiplier),
                    ctr: 3.01,
                    cpm: 31.05,
                    cpc: 0.35,
                    conversions: Math.floor(19 * multiplier),
                    date_start: getDateStart(period),
                    date_stop: 'today',
                }
            },
            {
                id: 'mock_4',
                name: 'Retargeting - Carrinho Abandonado',
                status: 'PAUSED',
                objective: 'CONVERSIONS',
                daily_budget: '1500',
                insights: {
                    impressions: Math.floor(13900 * multiplier),
                    clicks: Math.floor(465 * multiplier),
                    spend: (169.30 * multiplier).toFixed(2),
                    reach: Math.floor(1300 * multiplier),
                    ctr: 3.34,
                    cpm: 36.67,
                    cpc: 0.36,
                    conversions: Math.floor(9 * multiplier),
                    date_start: getDateStart(period),
                    date_stop: 'today',
                }
            },
        ],
        totalCampaigns: 4,
        activeCampaigns: 3,
        dataSource: 'mock',
        message: '⚠️ Usando dados de exemplo. Configure META_ACCESS_TOKEN no .env.local para dados reais.',
    }
}

function getDateStart(period: string) {
    const today = new Date()
    if (period === 'today') return today.toISOString().split('T')[0]
    if (period === 'last_7d') {
        const date = new Date(today)
        date.setDate(date.getDate() - 7)
        return date.toISOString().split('T')[0]
    }
    const date = new Date(today)
    date.setDate(date.getDate() - 30)
    return date.toISOString().split('T')[0]
}
