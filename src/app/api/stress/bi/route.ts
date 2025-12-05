import { NextResponse } from 'next/server'
import { BIAgent } from '@/agents/bi'

export async function POST(req: Request) {
    const agent = new BIAgent()

    console.log(`[Stress] Starting BI Test`)

    // Simulating heavy history calculation
    const history = Array.from({ length: 12 }).map(() => Math.floor(Math.random() * 50000) + 10000)

    const result = await agent.generateReport({
        revenueHistory: history,
        activeClients: 1000,
        churn: Math.floor(Math.random() * 100)
    })

    return NextResponse.json({
        success: true,
        data: result
    })
}
