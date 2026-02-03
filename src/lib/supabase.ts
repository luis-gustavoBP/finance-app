import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';

// Cliente Supabase corretamente configurado para Next.js App Router
export function createClient() {
    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

// Exporta uma instância singleton para uso em Client Components
export const supabase = createClient();
