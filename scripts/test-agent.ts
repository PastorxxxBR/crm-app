// Run with: npx ts-node --project tsconfig.json scripts/test-agent.ts
import { MarketingAgent } from '../src/agents/marketing/index.ts'
import * as dotenv from 'dotenv'

dotenv.config()

async function runTest() {
    console.log('--- STARTING MARKETING AGENT TEST ---')

    const agent = new MarketingAgent()
    const campaignId = '00000000-0000-0000-0000-000000000000' // Mock ID or create one if needed

    // Test Scenario Data
    const mockMetrics = {
        reach: 1000,
        impressions: 1000,
        clicks: 20,
        conversions: 5
    }

    console.log('Simulating Campaign Metrics:', mockMetrics)

    // Execute Analysis
    // We pass the metrics explicitly to bypass the Integration Agent mock and use the scenario values
    await agent.analyzePerformance(campaignId, mockMetrics)

    console.log('--- TEST COMPLETE ---')
}

runTest().catch(console.error)
