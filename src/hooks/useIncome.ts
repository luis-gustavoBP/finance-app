import { useEffect } from 'react';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { useAuth } from '@/contexts/AuthContext';

type IncomeEntry = Database['public']['Tables']['income_entries']['Row'];
type IncomeInsert = Database['public']['Tables']['income_entries']['Insert'];
type IncomeUpdate = Database['public']['Tables']['income_entries']['Update'];

export function useIncome() {
    const { user } = useAuth();

    const { data, error, mutate } = useSWR<IncomeEntry[]>(
        user ? 'income_entries' : null,
        async () => {
            const { data, error } = await supabase
                .from('income_entries')
                .select('*')
                .order('received_at', { ascending: false });

            if (error) throw error;
            return data || [];
        }
    );

    // Realtime subscription
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('income_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'income_entries',
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

    const addIncome = async (income: Omit<IncomeInsert, 'id' | 'user_id' | 'created_at'>) => {
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('income_entries')
            .insert({
                ...income,
                user_id: user.id,
            } as any)
            .select()
            .single();

        if (error) throw error;
        mutate();
        return data;
    };

    const updateIncome = async (id: string, updates: Omit<IncomeUpdate, 'id' | 'user_id' | 'created_at'>) => {
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('income_entries')
            .update(updates as any)
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;
        mutate();
    };

    const deleteIncome = async (id: string) => {
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('income_entries')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;
        mutate();
    };

    return {
        incomeEntries: data || [],
        isLoading: !data && !error,
        error,
        refresh: mutate,
        addIncome,
        updateIncome,
        deleteIncome,
    };
}
