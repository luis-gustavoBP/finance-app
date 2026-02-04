-- [ADVANCED SECURITY MIGRATION]
-- This script sets up RLS and audit triggers using high-security patterns.

-- 1. Helper function for updating timestamps (SECURITY DEFINER for reliability)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revoke public execution for safety
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO service_role;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated;


-- 2. General helper to ensure RLS and audit triggers (Idempotent)
CREATE OR REPLACE FUNCTION public.ensure_user_policies(table_name text)
RETURNS void AS $$
BEGIN
    -- Enable RLS
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);

    -- Ensure updated_at column and trigger
    BEGIN
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()', table_name);
        EXECUTE format('
            CREATE TRIGGER set_updated_at_%I
            BEFORE UPDATE ON %I
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', table_name, table_name);
    EXCEPTION WHEN duplicate_object THEN
        -- Trigger already exists, ignore
    END;

    -- Create Policies (Using SELECT auth.uid() for optimized execution plans)
    -- SELECT
    EXECUTE format('DROP POLICY IF EXISTS users_select_own_%I ON %I', table_name, table_name);
    EXECUTE format('CREATE POLICY users_select_own_%I ON %I FOR SELECT USING (auth.uid() = user_id)', table_name, table_name);

    -- INSERT
    EXECUTE format('DROP POLICY IF EXISTS users_insert_own_%I ON %I', table_name, table_name);
    EXECUTE format('CREATE POLICY users_insert_own_%I ON %I FOR INSERT WITH CHECK (auth.uid() = user_id)', table_name, table_name);

    -- UPDATE
    EXECUTE format('DROP POLICY IF EXISTS users_update_own_%I ON %I', table_name, table_name);
    EXECUTE format('CREATE POLICY users_update_own_%I ON %I FOR UPDATE USING (auth.uid() = user_id)', table_name, table_name);

    -- DELETE
    EXECUTE format('DROP POLICY IF EXISTS users_delete_own_%I ON %I', table_name, table_name);
    EXECUTE format('CREATE POLICY users_delete_own_%I ON %I FOR DELETE USING (auth.uid() = user_id)', table_name, table_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revoke public execution for safety
REVOKE EXECUTE ON FUNCTION public.ensure_user_policies(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_user_policies(text) TO service_role;


-- 3. Apply to all managed tables
SELECT public.ensure_user_policies('transactions');
SELECT public.ensure_user_policies('cards');
SELECT public.ensure_user_policies('invoices');
SELECT public.ensure_user_policies('categories');
SELECT public.ensure_user_policies('income_entries');
SELECT public.ensure_user_policies('user_settings');


-- 4. Cleanup (Keep the helper if you want to use it for future tables, or drop it)
-- DROP FUNCTION public.ensure_user_policies(text);

-- 5. Special case for 'profiles' if it exists (uses 'id' instead of 'user_id')
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "users_select_own_profile" ON public.profiles;
        CREATE POLICY "users_select_own_profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
        
        DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
        CREATE POLICY "users_update_own_profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

COMMENT ON FUNCTION public.update_updated_at_column() IS 'Helper to automatically update the updated_at timestamp.';
COMMENT ON FUNCTION public.ensure_user_policies(text) IS 'Idempotent helper to apply standard RLS policies and audit triggers to a table.';
