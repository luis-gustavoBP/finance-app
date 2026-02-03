import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { useAuth } from '@/contexts/AuthContext';

type Card = Database['public']['Tables']['cards']['Row'];
type CardUpdate = Database['public']['Tables']['cards']['Update'];

export function useCardConfig() {
    const { user } = useAuth();

    const { data, error, mutate } = useSWR<Card[]>(
        user ? 'cards-config' : null,
        async () => {
            const { data, error } = await supabase
                .from('cards')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            return data || [];
        }
    );

    const updateCardConfig = async (
        cardId: string,
        config: { due_day?: number; closing_days_before?: number }
    ) => {
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('cards')
            .update(config as any)
            .eq('id', cardId)
            .eq('user_id', user.id);

        if (error) throw error;
        mutate(); // Refresh data
    };

    const deleteCard = async (cardId: string) => {
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('cards')
            .update({ is_active: false })
            .eq('id', cardId)
            .eq('user_id', user.id);

        if (error) throw error;
        mutate();
    };

    return {
        cards: data || [],
        isLoading: !data && !error,
        error,
        updateCardConfig,
        deleteCard,
        refresh: mutate
    };
}
