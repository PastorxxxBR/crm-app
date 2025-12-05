import { NextResponse } from 'next/server'
import { MarketingAgent } from '@/agents/marketing'

export async function GET() {
    console.log('--- STARTING MARKETING AGENT TEST (API) ---')

    try {
        const agent = new MarketingAgent()
        const campaignId = '00000000-0000-0000-0000-000000000000'

        // Test Scenario Data (Reach 1000, Clicks 20 -> 2% rate)
        // Rate < 5% should trigger "Optimization" suggestion.
        const mockMetrics = {
            reach: 1000,
            impressions: 1000,
            clicks: 20,
            conversions: 5
        }

        console.log('Simulating Campaign Metrics:', mockMetrics)

        // Execute Analysis
        const result = await agent.analyzePerformance(campaignId, mockMetrics)

        console.log('--- TEST COMPLETE ---')
        return NextResponse.json({ success: true, result })
    } catch (error: any) {
        console.error('Test Failed:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
