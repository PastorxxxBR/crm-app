import { NextResponse } from 'next/server'
import { SecurityAgent } from '@/agents/security'

export async function POST(req: Request) {
    const { count = 500 } = await req.json()
    const agent = new SecurityAgent()
    const results = []

    console.log(`[Stress] Starting Security Test: ${count} logs`)

    const tasks = Array.from({ length: count }).map((_, i) => {
        const isBad = Math.random() > 0.8
        const action = isBad ? 'unauthorized_access' : 'login'
        const actor = isBad ? 'unknown_ip' : `user_${i}`

        return agent.analyzeLog({ actor, action, id: i })
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
