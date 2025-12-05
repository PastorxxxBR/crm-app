import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
    try {
        const { email, phone, checkout_url } = await req.json()

        if (!email && !phone) {
            return NextResponse.json({ error: 'Missing contact info' }, { status: 400 })
        }

        // 1. Add to Automation Queue (DB Trigger or Cron will pick this up)
        // We add a 'process_after' delay of 30 minutes
        const processAfter = new Date()
        processAfter.setMinutes(processAfter.getMinutes() + 30)

        const { error } = await supabase
            .from('automation_queue')
            .insert({
                trigger_type: 'abandoned_cart',
                payload: { email, phone, checkout_url },
                status: 'pending',
                process_after: processAfter.toISOString()
            })

        if (error) throw error

        return NextResponse.json({ success: true, message: 'Recovery scheduled' })
    } catch (error: any) {
        console.error('Abandoned Cart Webook Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
