// src/app/api/cash-register/close/route.ts
import { NextResponse } from 'next/server';
import { CashRegisterAgent } from '@/agents/cash-register';

export async function POST(request: Request) {
    try {
        const { registerId, finalBalance, pixReceived, bankAccount } = await request.json();
        const agent = new CashRegisterAgent();

        const result = await agent.closeRegister(
            registerId,
            Number(finalBalance),
            pixReceived || false,
            bankAccount
        );

        return NextResponse.json({ success: true, register: result }, { status: 200 });
    } catch (err: any) {
        console.error('Error closing cash register:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
