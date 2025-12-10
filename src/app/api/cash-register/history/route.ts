// src/app/api/cash-register/history/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const registerId = searchParams.get('registerId');

        if (!registerId) {
            return NextResponse.json({ success: false, error: 'registerId is required' }, { status: 400 });
        }

        // Fetch register details
        const { data: register, error: regError } = await supabase
            .from('cash_registers')
            .select('*')
            .eq('id', registerId)
            .single();

        if (regError) throw regError;

        // Fetch entries
        const { data: entries, error: entriesError } = await supabase
            .from('cash_register_entries')
            .select('*')
            .eq('cash_register_id', registerId)
            .order('created_at', { ascending: false });

        if (entriesError) throw entriesError;

        return NextResponse.json({
            success: true,
            register,
            entries,
            summary: {
                totalEntries: entries?.length || 0,
                totalSales: register?.total_sales || 0,
                commission: register?.total_commission || 0
            }
        }, { status: 200 });
    } catch (err: any) {
        console.error('Error fetching cash register history:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
