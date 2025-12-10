// src/app/api/cash-register/open/route.ts
import { NextResponse } from 'next/server';
import { CashRegisterAgent } from '@/agents/cash-register';

export async function POST(request: Request) {
    try {
        const { storeId, cashierId, initialBalance } = await request.json();
        const agent = new CashRegisterAgent();
        const register = await agent.openRegister(storeId, cashierId, Number(initialBalance));
        return NextResponse.json({ success: true, register }, { status: 200 });
    } catch (err: any) {
        console.error('Error opening cash register:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
