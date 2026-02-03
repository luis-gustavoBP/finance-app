'use client';

import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { useAuth } from '@/contexts/AuthContext';

type Card = Database['public']['Tables']['cards']['Row'];
type CardInsert = Database['public']['Tables']['cards']['Insert'];

export function useCards() {
    const { user } = useAuth();

    // Fetch cards (RLS automatically filters by user_id)
    const { data, error, mutate } = useSWR<Card[]>(
        user ? 'cards' : null,
        async () => {
            const { data, error } = await supabase
                .from('cards')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        }
    );

    const addCard = async (card: Partial<CardInsert>) => {
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('cards')
            .insert({
                ...card,
                user_id: user.id,
            } as any)
            .select()
            .single();

        if (error) throw error;
        mutate();
        return data;
    };

    const updateCardConfig = async (
        cardId: string,
        config: { due_day?: number; closing_days_before?: number }
    ) => {
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('cards' as any)
            .update(config as any)
            .eq('id', cardId)
            .eq('user_id', user.id);

        if (error) throw error;
        mutate();
    };

    const deleteCard = async (cardId: string) => {
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('cards' as any)
            .update({ is_active: false } as any)
            .eq('id', cardId)
            .eq('user_id', user.id);

        if (error) throw error;
        mutate();
    };

    return {
        cards: data || [],
        isLoading: data === undefined && !error,
        error,
        refresh: mutate,
        addCard,
        updateCardConfig,
        deleteCard,
    };
}
