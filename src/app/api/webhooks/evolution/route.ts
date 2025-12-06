import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const apiKey = req.headers.get('apikey')

        // 1. Basic Security Check (Optional: Match with EVOLUTION_API_KEY if configured in global webhooks)
        // if (apiKey !== process.env.EVOLUTION_API_KEY) {
        //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        // }

        // 2. Log Raw Event to MongoDB
        let client;
        try {
            client = await clientPromise
        } catch (e) {
            console.warn("MongoDB not available, skipping log")
            return NextResponse.json({ success: true, warning: "DB unavailable" }, { status: 200 })
        }

        const db = client.db('crm_db') // Use env var for DB name in production

        await db.collection('webhook_logs').insertOne({
            source: 'evolution_api',
            event_type: body.event || 'unknown',
            payload: body,
            received_at: new Date()
        })

        // 3. Process Specific Events
        // Example: New Message Received
        if (body.event === 'messages.upsert') {
            const message = body.data?.message
            // TODO: Add logic to find/create customer in Supabase
            console.log('New WhatsApp Message:', message?.conversation || message?.extendedTextMessage?.text)
        }

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error: any) {
        console.error('Webhook Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
