'use client';

import { useEffect } from 'react';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { useAuth } from '@/contexts/AuthContext';

type Invoice = Database['public']['Tables']['invoices']['Row'];
type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];
type InvoiceUpdate = Database['public']['Tables']['invoices']['Update'];

export function useInvoices() {
    const { user } = useAuth();

    const { data, error, mutate } = useSWR<Invoice[]>(
        user ? 'invoices' : null,
        async () => {
            const { data, error } = await supabase
                .from('invoices')
                .select('*')
                .order('year', { ascending: false })
                .order('month', { ascending: false });

            if (error) throw error;
            return data || [];
        }
    );

    // Realtime subscription
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('invoices_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'invoices',
                },
                () => {
                    mutate();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, mutate]);

    const getInvoice = (cardId: string, month: number, year: number) => {
        return data?.find(inv =>
            inv.card_id === cardId &&
            inv.month === month &&
            inv.year === year
        );
    };

    const updateInvoiceStatus = async (
        cardId: string,
        month: number,
        year: number,
        status: 'OPEN' | 'CLOSED' | 'PAID',
        amount_cents?: number
    ) => {
        if (!user) throw new Error('Not authenticated');

        const existing = getInvoice(cardId, month, year);

        if (existing) {
            const updates: InvoiceUpdate = {
                status,
                updated_at: new Date().toISOString()
            };

            if (status === 'PAID') {
                updates.paid_at = new Date().toISOString();
            }
            if (amount_cents !== undefined) {
                updates.amount_cents = amount_cents;
            }

            const { error } = await supabase
                .from('invoices')
                .update(updates)
                .eq('id', existing.id);

            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('invoices')
                .insert({
                    user_id: user.id,
                    card_id: cardId,
                    month,
                    year,
                    status,
                    amount_cents: amount_cents || 0,
                    paid_at: status === 'PAID' ? new Date().toISOString() : null
                });

            if (error) throw error;
        }
        mutate();
    };

    return {
        invoices: data || [],
        isLoading: !data && !error,
        error,
        refresh: mutate,
        getInvoice,
        updateInvoiceStatus
    };
}
