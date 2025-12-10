import { NextResponse } from 'next/server'
import { agentService } from '@/services/agents'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { from, message } = body

        if (!from || !message) {
            return NextResponse.json(
                { error: 'Missing required fields: from, message' },
                { status: 400 }
            )
        }

        console.log(`[Webhook] Incoming message from ${from}: ${message}`)

        // Handle message with CustomerServiceAgent
        const result = await agentService.customerService.handleIncomingMessage({
            from,
            message,
            timestamp: new Date()
        })

        return NextResponse.json({
            success: true,
            response: result.response,
            ticket: result.ticket
        })

    } catch (error: any) {
        console.error('[Webhook] Error:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}

// GET endpoint for testing
export async function GET() {
    try {
        // Test message
        const testResult = await agentService.customerService.handleIncomingMessage({
            from: '5511999999999',
            message: 'Qual o prazo de entrega?'
        })

        return NextResponse.json({
            success: true,
            test: true,
            result: testResult
        })

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
