'use client';

import { useEffect } from 'react';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { useAuth } from '@/contexts/AuthContext';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];

interface TransactionWithRelations extends Transaction {
    card?: Database['public']['Tables']['cards']['Row'] | null;
    category?: Database['public']['Tables']['categories']['Row'] | null;
}

export function useTransactions() {
    const { user } = useAuth();

    // Fetch transactions (RLS automatically filters by user_id)
    const { data, error, mutate } = useSWR<TransactionWithRelations[]>(
        user ? 'transactions' : null,
        async () => {
            const { data, error } = await supabase
                .from('transactions')
                .select(`
                    *,
                    card:cards(*),
                    category:categories(*)
                `)
                .order('posted_at', { ascending: false });

            if (error) throw error;
            return data || [];
        }
    );

    // Realtime subscription
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('transactions_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'transactions',
                },
                () => {
                    mutate(); // Refetch on any change
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, mutate]);

    const addTransaction = async (transaction: Omit<TransactionInsert, 'id' | 'user_id' | 'created_at'>) => {
        if (!user) throw new Error('Not authenticated');

        console.log('Inserting transaction:', transaction);

        const { data, error } = await supabase
            .from('transactions')
            .insert({
                description: transaction.description,
                amount_cents: transaction.amount_cents,
                category_id: transaction.category_id || null,
                card_id: transaction.card_id || null,
                posted_at: transaction.posted_at || new Date().toISOString().split('T')[0],
                installments: transaction.installments || 1,
                installment_number: 1,
                user_id: user.id,
                include_in_weekly_plan: transaction.include_in_weekly_plan ?? true,
            })
            .select();

        if (error) {
            console.error('Insert error details:', error);
            throw error;
        }
        mutate();
        return data?.[0];
    };

    const addTransactionWithInstallments = async (
        transaction: Omit<TransactionInsert, 'id' | 'user_id' | 'created_at'>
    ) => {
        if (!user) throw new Error('Not authenticated');

        // If only 1 installment, use normal insert
        if ((transaction.installments || 1) <= 1) {
            return addTransaction(transaction);
        }

        console.log('Sending complex transaction to RPC:', transaction);

        const { error } = await supabase.rpc('create_installment_transactions', {
            p_user_id: user.id,
            p_description: transaction.description,
            p_total_amount_cents: transaction.amount_cents,
            p_category_id: transaction.category_id!,
            p_card_id: transaction.card_id || null,
            p_installments: transaction.installments!,
            p_first_date: transaction.posted_at || new Date().toISOString().split('T')[0],
            p_include_in_weekly_plan: transaction.include_in_weekly_plan ?? true,
        });

        if (error) {
            console.error('RPC error details:', error);
            throw error;
        }
        mutate();
    };

    const deleteTransaction = async (transactionId: string) => {
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', transactionId)
            .eq('user_id', user.id);

        if (error) throw error;
        mutate();
    };

    return {
        transactions: data || [],
        isLoading: data === undefined && !error,
        error,
        refresh: mutate,
        addTransaction,
        addTransactionWithInstallments,
        deleteTransaction,
    };
}
