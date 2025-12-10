import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// SSE endpoint for real-time notifications
export async function GET(request: Request) {
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
        start(controller) {
            // Send initial connection message
            const data = JSON.stringify({
                id: Date.now().toString(),
                type: 'info',
                title: 'Conectado',
                message: 'Sistema de notificações ativo',
                timestamp: new Date(),
                read: false
            })

            controller.enqueue(encoder.encode(`data: ${data}\n\n`))

            // Keep connection alive with heartbeat
            const heartbeat = setInterval(() => {
                controller.enqueue(encoder.encode(': heartbeat\n\n'))
            }, 30000) // Every 30 seconds

            // Cleanup on close
            request.signal.addEventListener('abort', () => {
                clearInterval(heartbeat)
                controller.close()
            })

            // TODO: Subscribe to Event Bus and send notifications
            // Example:
            // eventBus.subscribe('agent:*:*', (payload) => {
            //     const notification = {
            //         id: Date.now().toString(),
            //         type: determineType(payload),
            //         title: payload.title,
            //         message: payload.message,
            //         timestamp: new Date(),
            //         read: false
            //     }
            //     controller.enqueue(encoder.encode(`data: ${JSON.stringify(notification)}\n\n`))
            // })
        }
    })

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        }
    })
}
