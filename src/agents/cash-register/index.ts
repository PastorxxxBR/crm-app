// src/agents/cash-register/index.ts
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase'; // assuming existing supabase client
import { evolution } from '../../lib/evolution'; // wrapper for Evolution API (WhatsApp)

export class CashRegisterAgent {
    private supabase = supabase;

    /** Activate a store and notify via WhatsApp */
    async activateStore(storeId: string, storeName: string) {
        // Create a closed register entry to mark the store as ready
        const { data, error } = await this.supabase
            .from('cash_registers')
            .insert({
                store_id: storeId,
                cashier_id: null,
                opened_at: new Date().toISOString(),
                closed_at: new Date().toISOString(),
                initial_balance: 0,
                status: 'closed',
            })
            .select();

        if (error) throw error;

        // Send WhatsApp notification via Evolution API
        const message = `Loja ${storeName} ativada. Seu caixa está pronto para uso.`;
        try {
            if (process.env.EVOLUTION_ADMIN_PHONE) {
                await evolution.sendMessage(
                    process.env.EVOLUTION_ADMIN_PHONE,
                    message
                );
            }
        } catch (e) {
            console.warn('Failed to send WhatsApp notification', e);
        }
        return data ? data[0] : null;
    }

    /** Open a cash register for a specific cashier */
    async openRegister(
        storeId: string,
        cashierId: string,
        initialBalance: number
    ) {
        const { data, error } = await this.supabase
            .from('cash_registers')
            .insert({
                store_id: storeId,
                cashier_id: cashierId,
                opened_at: new Date().toISOString(),
                initial_balance: initialBalance,
                status: 'open'
            })
            .select();

        if (error) throw error;
        return data ? data[0] : null;
    }

    /** Add an item to the register */
    async addItem(
        registerId: string,
        params: {
            productId?: string;
            description?: string;
            quantity?: number;
            unitPrice: number;
        }
    ) {
        const { productId, description, quantity = 1, unitPrice } = params;
        const { data, error } = await this.supabase
            .from('cash_register_entries')
            .insert({
                cash_register_id: registerId,
                product_id: productId ?? null,
                description: description ?? null,
                quantity,
                unit_price: unitPrice,
            })
            .select();

        if (error) throw error;
        return data ? data[0] : null;
    }

    /** Close the register, calculate commission and optionally mark PIX received */
    async closeRegister(
        registerId: string,
        finalBalance: number,
        pixReceived: boolean,
        bankAccount?: string
    ) {
        const { data, error } = await this.supabase
            .from('cash_registers')
            .update({
                closed_at: new Date().toISOString(),
                final_balance: finalBalance,
                pix_received: pixReceived,
                bank_account: bankAccount ?? null,
                status: 'closed'
            })
            .eq('id', registerId)
            .select();

        if (error) throw error;
        return data ? data[0] : null;
    }

    /** Calculate commission based on stored commission_rate */
    async calculateCommission(registerId: string) {
        const { data, error } = await this.supabase
            .from('cash_registers')
            .select('total_sales, commission_rate')
            .eq('id', registerId)
            .single();

        if (error) throw error;
        if (!data) return 0;

        const { total_sales, commission_rate } = data as any;
        if (!commission_rate) return 0;
        return (total_sales * commission_rate) / 100;
    }
}
