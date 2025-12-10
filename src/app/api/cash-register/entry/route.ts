// src/app/api/cash-register/entry/route.ts
import { NextResponse } from 'next/server';
import { CashRegisterAgent } from '@/agents/cash-register';

export async function POST(request: Request) {
    try {
        const { registerId, productId, description, quantity, unitPrice } = await request.json();
        const agent = new CashRegisterAgent();
        const entry = await agent.addItem(registerId, {
            productId,
            description,
            quantity: Number(quantity) || 1,
            unitPrice: Number(unitPrice),
        });
        return NextResponse.json({ success: true, entry }, { status: 200 });
    } catch (err: any) {
        console.error('Error adding cash register entry:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
