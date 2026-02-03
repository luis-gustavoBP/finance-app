'use client';

import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { useAuth } from '@/contexts/AuthContext';

type UserSettings = Database['public']['Tables']['user_settings']['Row'];

export function useSettings() {
    const { user } = useAuth();

    const { data, error, mutate } = useSWR<UserSettings | null>(
        user ? `settings_${user.id}` : null,
        async () => {
            const { data, error } = await supabase
                .from('user_settings')
                .select('*')
                .eq('user_id', user!.id)
                .single();

            if (error) {
                // If the table doesn't exist (migration not run), return null gracefully
                if (error.code === '42P01') {
                    console.error('ERRO: Tabela user_settings não encontrada. Por favor, execute o script SQL supabase_schema_v4_limits.sql no editor do Supabase.');
                    return null;
                }

                // If not found, create default
                if (error.code === 'PGRST116') {
                    try {
                        const { data: newData, error: createError } = await supabase
                            .from('user_settings')
                            .insert({ user_id: user!.id, global_monthly_limit_cents: 0 })
                            .select()
                            .single();

                        if (createError) {
                            if (createError.code === '42P01') return null;
                            throw createError;
                        }
                        return newData;
                    } catch (e) {
                        return null;
                    }
                }
                throw error;
            }
            return data;
        }
    );

    const updateSettings = async (updates: Partial<UserSettings>) => {
        if (!user) return;
        const { error } = await (supabase
            .from('user_settings') as any)
            .update(updates)
            .eq('user_id', user.id);

        if (error) throw error;
        mutate();
    };

    return {
        settings: data,
        isLoading: data === undefined && !error,
        error,
        updateSettings
    };
}
