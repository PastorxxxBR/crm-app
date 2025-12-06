import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase' // Note: Should use service_role client for Cron
import { evolution } from '@/lib/evolution'
import clientPromise from '@/lib/mongodb'

// In a real scenario, use a Service Role client to bypass RLS
// In a real scenario, use a Service Role client to bypass RLS
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key"
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"

import { createClient } from '@supabase/supabase-js'
const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

export async function GET(req: Request) {
    // Security Check (CRON_SECRET)
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // 1. Fetch campaigns scheduled for now
        const { data: campaigns, error } = await adminSupabase
            .from('campaigns')
            .select('*')
            .eq('status', 'scheduled')
            .lte('scheduled_at', new Date().toISOString())
            .limit(5) // Process in batches

        if (error) throw error
        if (!campaigns || campaigns.length === 0) {
            return NextResponse.json({ message: 'No campaigns to process' })
        }

        const results = []

        // 2. Process each campaign
        for (const campaign of campaigns) {
            // Mark as processing
            await adminSupabase.from('campaigns').update({ status: 'processing' }).eq('id', campaign.id)

            let processedCount = 0

            // 3. Segment Audience
            let query = adminSupabase.from('customers').select('id, phone, full_name')

            // Apply filters from 'segment' JSON
            // Example: { "tag": "atacado" }
            if (campaign.segment?.tag) {
                query = query.eq('segment', campaign.segment.tag)
            }

            const { data: customers } = await query

            if (customers) {
                for (const customer of customers) {
                    if (!customer.phone) continue

                    // 4. Send Message via Evolution API
                    try {
                        // Replace variables
                        const text = campaign.message_template.replace('{{name}}', customer.full_name)

                        await evolution.sendMessage(customer.phone, text)

                        // Log Success
                        await adminSupabase.from('campaign_logs').insert({
                            campaign_id: campaign.id,
                            customer_id: customer.id,
                            status: 'sent'
                        })
                        processedCount++
                    } catch (err: any) {
                        // Log Failure
                        await adminSupabase.from('campaign_logs').insert({
                            campaign_id: campaign.id,
                            customer_id: customer.id,
                            status: 'failed',
                            error_message: err.message
                        })
                    }
                }
            }

            // 5. Mark Complete
            await adminSupabase.from('campaigns').update({ status: 'completed' }).eq('id', campaign.id)
            results.push({ campaign: campaign.name, sent: processedCount })
        }

        return NextResponse.json({ success: true, processed: results })

    } catch (error: any) {
        console.error('Campaign Cron Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
