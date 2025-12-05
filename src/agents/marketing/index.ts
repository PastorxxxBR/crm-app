import { BaseAgent } from '../base'
// import { agentService } from '../../services/agents'
import { supabase } from '@/lib/supabase'

// Simple interface for Campaign
interface CampaignParams {
    name: string
    segment: string
    message: string
}

export class MarketingAgent extends BaseAgent {
    constructor() {
        super('marketing')
    }

    /**
     * Plan a new campaign
     */
    public async createCampaign(params: CampaignParams) {
        this.log(`Creating campaign: ${params.name}`)

        await this.publishEvent('campaign_created', {
            ...params,
            timestamp: new Date().toISOString()
        })

        return { status: 'success', id: 'mock-id' }
    }

    /**
     * Analyze campaign performance and generate insights
     */
    public async analyzePerformance(campaignId: string, explicitMetrics?: any) {
        this.log(`Analyzing performance for ${campaignId}...`)

        // 1. Get Metrics (External or Explicit)
        let metrics = explicitMetrics
        if (!metrics) {
            const { agentService } = await import('../../services/agents')
            metrics = await agentService.integrations.getSocialMetrics(campaignId)
        }

        // 2. Calculate Engagement Rate
        const base = metrics.impressions || metrics.reach || 1
        const engagementRate = (metrics.clicks / base) * 100
        this.log(`Engagement Rate: ${engagementRate.toFixed(2)}% based on ${base} views`)

        // 3. Save Metrics to DB
        try {
            await supabase.from('campaigns').update({ metrics }).eq('id', campaignId)
        } catch (e) {
            this.log('Warning: Failed to save metrics to DB (Expected in Test Env)')
        }

        // 4. Decision Engine (AI Based)
        return await this.generateRecommendations(campaignId, metrics, engagementRate)
    }

    /**
     * Internal Decision Engine using Gemini API
     */
    private async generateRecommendations(campaignId: string, metrics: any, rate: number) {
        this.log('Generating recommendations using Gemini API...')
        const { GoogleGenerativeAI } = await import("@google/generative-ai");

        const genAI = new GoogleGenerativeAI("AIzaSyDyy_E4jbsQ8JFT1HyYvVCoxwMHsIhmPQo");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        this.log('DEBUG: USING GEMINI 1.5 PRO')

        const prompt = `
            Act as a Senior Marketing Analyst.
            Analyze this campaign performance:
            - Channel: Instagram
            - Reach/Impressions: ${metrics.reach || metrics.impressions}
            - Clicks: ${metrics.clicks}
            - Conversions: ${metrics.conversions}
            - Engagement Rate: ${rate.toFixed(2)}%
            
            Based on this, generate 1 concise, actionable recommendation to improve results.
            Format the response strictly as valid JSON with the following keys: type (optimization, scaling, or content), suggestion (string), priority (high, medium, or low).
            Do not include markdown formatting.
        `

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();

            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const aiRecommendation = JSON.parse(text);

            this.log(`Gemini Suggestion: ${aiRecommendation.suggestion}`)

            try {
                await supabase.from('marketing_recommendations').insert({
                    campaign_id: campaignId,
                    type: aiRecommendation.type,
                    suggestion: aiRecommendation.suggestion,
                    priority: aiRecommendation.priority,
                    status: 'pending'
                })
            } catch (e) {
                this.log('Warning: Failed to persist recommendation (Expected in Test Env)')
            }

            await this.publishEvent('recommendations_generated', { source: 'gemini', ...aiRecommendation })

            return aiRecommendation

        } catch (error: any) {
            this.log(`Error calling Gemini API: ${error.message}`)
            // Fallback for valid flow testing despite Key/Model issues
            const fallback = {
                type: 'optimization',
                suggestion: '[FALLBACK AI] Increase visual contrast in ad creatives to boost CTR above 2%. (Actual AI call failed: Model/Key Error)',
                priority: 'high'
            }

            // Persist Fallback
            try {
                await supabase.from('marketing_recommendations').insert({
                    campaign_id: campaignId,
                    type: fallback.type,
                    suggestion: fallback.suggestion,
                    priority: fallback.priority,
                    status: 'pending'
                })
            } catch (e) { }

            return fallback
        }
    }

    public async onMessageFailed(payload: any) {
        this.log(`Received failure for ${payload.to}. Removing from active leads.`)
    }
}
