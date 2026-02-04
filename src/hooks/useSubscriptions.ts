'use client';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import useSWR from 'swr';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert'];
type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update'];

interface SubscriptionWithCategory extends Subscription {
    category?: Database['public']['Tables']['categories']['Row'] | null;
}

export function useSubscriptions() {
    const { user } = useAuth();

    const { data, error, mutate } = useSWR<SubscriptionWithCategory[]>(
        user ? 'subscriptions' : null,
        async () => {
            const { data, error } = await supabase
                .from('subscriptions')
                .select(`
                    *,
                    category:categories(*)
                `)
                .order('due_day', { ascending: true });

            if (error) throw error;
            return data || [];
        }
    );

    const addSubscription = async (subscription: Omit<SubscriptionInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('subscriptions')
            .insert({
                ...subscription,
                user_id: user.id,
            })
            .select()
            .single();

        if (error) throw error;
        mutate();
        return data;
    };

    const updateSubscription = async (id: string, updates: Omit<SubscriptionUpdate, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('subscriptions')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;
        mutate();
    };

    const deleteSubscription = async (id: string) => {
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('subscriptions')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;
        mutate();
    };

    const toggleActive = async (id: string, currentActive: boolean) => {
        await updateSubscription(id, { active: !currentActive });
    };

    return {
        subscriptions: data || [],
        isLoading: !data && !error,
        error,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        toggleActive
    };
}
