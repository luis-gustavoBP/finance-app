import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { useAuth } from '@/contexts/AuthContext';
import { DEFAULT_CATEGORIES } from '@/lib/defaultCategories';
import { useEffect, useRef } from 'react';

type Category = Database['public']['Tables']['categories']['Row'];
type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

export function useCategories() {
    const { user } = useAuth();
    const hasCreatedDefaults = useRef(false);

    const { data, error, mutate } = useSWR<Category[]>(
        user ? 'categories' : null,
        async () => {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name');

            if (error) throw error;
            return data || [];
        }
    );

    // Auto-create default categories if user has none
    useEffect(() => {
        const createDefaultCategories = async () => {
            if (!user || !data || data.length > 0 || hasCreatedDefaults.current) return;

            hasCreatedDefaults.current = true;

            try {
                const categoriesToInsert = DEFAULT_CATEGORIES.map(cat => ({
                    ...cat,
                    user_id: user.id,
                }));

                await supabase.from('categories').insert(categoriesToInsert as any);
                mutate();
            } catch (error) {
                console.error('Failed to create default categories:', error);
            }
        };

        createDefaultCategories();
    }, [user, data, mutate]);

    const addCategory = async (category: Omit<CategoryInsert, 'id' | 'user_id' | 'created_at'>) => {
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('categories')
            .insert({
                ...category,
                user_id: user.id,
            } as any)
            .select()
            .single();

        if (error) throw error;
        mutate();
        return data;
    };

    const updateCategory = async (id: string, updates: Omit<CategoryUpdate, 'id' | 'user_id' | 'created_at'>) => {
        if (!user) throw new Error('Not authenticated');

        const { error } = await (supabase
            .from('categories') as any)
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;
        mutate();
    };

    const deleteCategory = async (id: string) => {
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            // Check if error is due to existing transactions
            if (error.message.includes('existing transactions')) {
                throw new Error('Não é possível excluir categoria com transações vinculadas');
            }
            throw error;
        }
        mutate();
    };

    return {
        categories: data || [],
        isLoading: !data && !error,
        error,
        mutate,
        addCategory,
        updateCategory,
        deleteCategory,
    };
}
