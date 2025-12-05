import { NextResponse } from 'next/server'
import { MarketplacesAgent } from '@/agents/marketplaces'

export async function POST(req: Request) {
    const { count = 200 } = await req.json()
    const agent = new MarketplacesAgent()
    const results = []

    console.log(`[Stress] Starting Marketplaces Test: ${count} products`)

    const tasks = Array.from({ length: count }).map((_, i) => {
        const myPrice = Math.floor(Math.random() * 500) + 50
        const compPrice = Math.floor(myPrice * (0.8 + Math.random() * 0.4)) // +/- 20%
        return agent.suggestPricing(`PROD-${i}`, myPrice, compPrice)
    })

    for (let i = 0; i < tasks.length; i += 50) {
        const chunk = tasks.slice(i, i + 50)
        const chunkRes = await Promise.all(chunk)
        results.push(...chunkRes)
    }

    return NextResponse.json({
        success: true,
        count: results.length,
        samples: results.slice(0, 3)
    })
}
