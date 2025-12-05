import { NextResponse } from 'next/server'
import { MarketingAgent } from '@/agents/marketing'

export async function POST(req: Request) {
    const { count = 100 } = await req.json()
    const agent = new MarketingAgent()
    const results = []

    console.log(`[Stress] Starting Marketing Test: ${count} campaigns`)

    const tasks = Array.from({ length: count }).map((_, i) => {
        const reach = Math.floor(Math.random() * 9500) + 500
        const clicks = Math.floor(Math.random() * 490) + 10
        return agent.analyzePerformance(`stress-camp-${i}`, {
            reach,
            clicks,
            conversions: Math.floor(clicks * 0.1)
        })
    })

    // Run in chunks of 10 to avoid blasting memory/rate limits too hard if real API worked
    // But since it's mock/fallback or fast API, Promise.all on chunks is good.
    for (let i = 0; i < tasks.length; i += 20) {
        const chunk = tasks.slice(i, i + 20)
        const chunkRes = await Promise.all(chunk)
        results.push(...chunkRes)
    }

    return NextResponse.json({
        success: true,
        count: results.length,
        samples: results.slice(0, 3)
    })
}
