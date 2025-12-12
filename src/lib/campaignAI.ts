import { GoogleGenerativeAI } from '@google/generative-ai'

// Cliente Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

export interface CampaignMetrics {
    budget: number
    targetAudience: number
    estimatedReach: number
    estimatedClicks: number
    estimatedConversions: number
    costPerClick: number
    costPerConversion: number
    roi: number
}

export interface CampaignSuggestion {
    name: string
    objective: string
    targetAudience: string
    channels: string[]
    budget: number
    duration: number
    expectedResults: {
        reach: number
        clicks: number
        conversions: number
        revenue: number
        roi: number
    }
    content: {
        headline: string
        description: string
        cta: string
        visualSuggestion: string
    }
    optimization: string[]
    risks: string[]
    confidenceScore: number
}

/**
 * Agente AI que analisa dados e cria campanhas otimizadas
 */
export class CampaignAIAgent {
    private model: any

    constructor() {
        this.model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    }

    /**
     * Analisa situação atual e sugere campanhas
     */
    async analyzeSituationAndSuggestCampaigns(businessData: {
        totalCustomers: number
        avgTicket: number
        monthlyRevenue: number
        topProducts: string[]
        customerSegments: string[]
        budget: number
    }): Promise<CampaignSuggestion[]> {
        const prompt = `
Você é um especialista em marketing digital e campanhas publicitárias.

DADOS DO NEGÓCIO:
- Total de Clientes: ${businessData.totalCustomers}
- Ticket Médio: R$ ${businessData.avgTicket}
- Receita Mensal: R$ ${businessData.monthlyRevenue}
- Produtos Principais: ${businessData.topProducts.join(', ')}
- Segmentos de Clientes: ${businessData.customerSegments.join(', ')}
- Orçamento Disponível: R$ ${businessData.budget}

TAREFA:
Crie 3 campanhas de marketing otimizadas com MÁXIMO ROI e MÍNIMO custo.

Para cada campanha, forneça:
1. Nome atrativo
2. Objetivo claro
3. Público-alvo específico
4. Canais (Meta Ads, Google Ads, Email, influencers)
5. Orçamento sugerido
6. Duração (dias)
7. Resultados esperados (alcance, cliques, conversões, receita, ROI)
8. Conteúdo (título, descrição, CTA, sugestão visual)
9. Dicas de otimização
10. Riscos potenciais
11. Score de confiança (0-100)

Responda APENAS com JSON válido no formato:
{
  "campaigns": [
    {
      "name": "string",
      "objective": "string",
      "targetAudience": "string",
      "channels": ["string"],
      "budget": number,
      "duration": number,
      "expectedResults": {
        "reach": number,
        "clicks": number,
        "conversions": number,
        "revenue": number,
        "roi": number
      },
      "content": {
        "headline": "string",
        "description": "string",
        "cta": "string",
        "visualSuggestion": "string"
      },
      "optimization": ["string"],
      "risks": ["string"],
      "confidenceScore": number
    }
  ]
}
`

        try {
            const result = await this.model.generateContent(prompt)
            const response = await result.response
            const text = response.text()

            // Extrai JSON da resposta
            const jsonMatch = text.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0])
                return data.campaigns || []
            }

            return []
        } catch (error) {
            console.error('Erro ao gerar campanhas:', error)
            return this.getFallbackCampaigns(businessData)
        }
    }

    /**
     * Prevê resultados de uma campanha antes de lançar
     */
    async predictCampaignResults(campaign: {
        name: string
        budget: number
        targetAudience: string
        channels: string[]
        duration: number
    }): Promise<{
        prediction: 'success' | 'moderate' | 'risk'
        expectedROI: number
        estimatedReach: number
        estimatedConversions: number
        recommendations: string[]
        warnings: string[]
    }> {
        const prompt = `
Você é um analista de marketing data-driven.

CAMPANHA PARA ANÁLISE:
- Nome: ${campaign.name}
- Orçamento: R$ ${campaign.budget}
- Público: ${campaign.targetAudience}
- Canais: ${campaign.channels.join(', ')}
- Duração: ${campaign.duration} dias

TAREFA:
Analise esta campanha e preveja os resultados.

Forneça:
1. Previsão (success/moderate/risk)
2. ROI esperado (%)
3. Alcance estimado (pessoas)
4. Conversões estimadas
5. Recomendações para otimizar
6. Avisos sobre riscos

Responda APENAS com JSON:
{
  "prediction": "success" ou "moderate" ou "risk",
  "expectedROI": number,
  "estimatedReach": number,
  "estimatedConversions": number,
  "recommendations": ["string"],
  "warnings": ["string"]
}
`

        try {
            const result = await this.model.generateContent(prompt)
            const response = await result.response
            const text = response.text()

            const jsonMatch = text.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0])
            }

            return this.getFallbackPrediction(campaign)
        } catch (error) {
            console.error('Erro ao prever resultados:', error)
            return this.getFallbackPrediction(campaign)
        }
    }

    /**
     * Otimiza uma campanha em andamento
     */
    async optimizeCampaign(campaignData: {
        name: string
        currentMetrics: {
            spent: number
            reach: number
            clicks: number
            conversions: number
            ctr: number
            cpc: number
        }
        remainingBudget: number
    }): Promise<{
        shouldContinue: boolean
        adjustments: string[]
        expectedImprovement: number
    }> {
        const prompt = `
Analise esta campanha em andamento:

DADOS ATUAIS:
- Gasto: R$ ${campaignData.currentMetrics.spent}
- Alcance: ${campaignData.currentMetrics.reach}
- Cliques: ${campaignData.currentMetrics.clicks}
- Conversões: ${campaignData.currentMetrics.conversions}
- CTR: ${campaignData.currentMetrics.ctr}%
- CPC: R$ ${campaignData.currentMetrics.cpc}
- Orçamento Restante: R$ ${campaignData.remainingBudget}

Forneça:
1. Deve continuar? (true/false)
2. Ajustes necessários
3. Melhoria esperada (%)

JSON:
{
  "shouldContinue": boolean,
  "adjustments": ["string"],
  "expectedImprovement": number
}
`

        try {
            const result = await this.model.generateContent(prompt)
            const response = await result.response
            const text = response.text()

            const jsonMatch = text.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0])
            }

            return { shouldContinue: true, adjustments: [], expectedImprovement: 0 }
        } catch (error) {
            console.error('Erro ao otimizar:', error)
            return { shouldContinue: true, adjustments: [], expectedImprovement: 0 }
        }
    }

    /**
     * Campanhas de fallback caso API falhe
     */
    private getFallbackCampaigns(businessData: any): CampaignSuggestion[] {
        return [
            {
                name: 'Conquista de Novos Clientes',
                objective: 'Aumentar base de clientes em 30%',
                targetAudience: 'Pessoas 18-35 interessadas em moda',
                channels: ['Meta Ads', 'Instagram Ads'],
                budget: businessData.budget * 0.4,
                duration: 30,
                expectedResults: {
                    reach: 50000,
                    clicks: 2500,
                    conversions: 125,
                    revenue: businessData.avgTicket * 125,
                    roi: 250,
                },
                content: {
                    headline: 'Transforme seu estilo!',
                    description: 'Moda de qualidade com até 40% OFF',
                    cta: 'Comprar Agora',
                    visualSuggestion: 'Carrossel com looks completos',
                },
                optimization: [
                    'Teste A/B de criativos',
                    'Segmentação por interesse em moda',
                    'Remarketing para visitantes',
                ],
                risks: ['Saturação de público', 'Concorrência alta'],
                confidenceScore: 85,
            },
        ]
    }

    private getFallbackPrediction(campaign: any) {
        return {
            prediction: 'moderate' as const,
            expectedROI: 150,
            estimatedReach: 30000,
            estimatedConversions: 100,
            recommendations: [
                'Teste diferentes criativos',
                'Ajuste público-alvo',
            ],
            warnings: ['Orçamento pode ser limitado'],
        }
    }
}

export const campaignAI = new CampaignAIAgent()
