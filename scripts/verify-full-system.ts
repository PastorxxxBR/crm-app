// Run with: npx ts-node --skip-project scripts/verify-full-system.ts
import { MarketingAgent } from '../src/agents/marketing/index.ts'
import { MarketplacesAgent } from '../src/agents/marketplaces/index.ts'
import { SecurityAgent } from '../src/agents/security/index.ts'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function run() {
    console.log('--- SYSTEM VERIFICATION ---')

    // 1. Marketing Agent
    try {
        console.log('\n[1] Testing Marketing Agent (Gemini)...')
        const mkt = new MarketingAgent()
        const res = await mkt.analyzePerformance('mock-id', { reach: 5000, clicks: 10, conversions: 0 })
        // rate = 0.2% -> should suggest optimization
        console.log('Marketing Recommendation:', res)
    } catch (e: any) { console.error('Marketing Fail:', e.message) }

    // 2. Marketplaces Agent
    try {
        console.log('\n[2] Testing Marketplaces Agent (Gemini Pricing)...')
        const mp = new MarketplacesAgent()
        const price = await mp.suggestPricing('TSHIRT-001', 50, 45)
        console.log('Price Suggestion:', price)
    } catch (e: any) { console.error('Marketplaces Fail:', e.message) }

    // 3. Security Agent
    try {
        console.log('\n[3] Testing Security Agent (Gemini Audit)...')
        const sec = new SecurityAgent()
        const audit = await sec.analyzeLog({ actor: 'admin', action: 'delete_all_users', resource: 'db' })
        console.log('Security Analysis:', audit)
    } catch (e: any) { console.error('Security Fail:', e.message) }

    console.log('\n--- VERIFICATION COMPLETE ---')
}

run()
