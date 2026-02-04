-- Migration: 002_account_and_subscriptions.sql
-- Goal: Add payment_method to transactions and create subscriptions table

-- 1. Add payment_method to transactions
-- Valid values: 'credit', 'debit', 'pix', 'cash'
-- Default to 'credit' to maintain backward compatibility (previously everything was implicitly credit card or didn't matter)
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'credit';

-- Add check constraint for valid payment methods
ALTER TABLE transactions
ADD CONSTRAINT check_payment_method CHECK (payment_method IN ('credit', 'debit', 'pix', 'cash'));


-- 2. Create Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount_cents INTEGER NOT NULL, -- Fixed monthly amount
    category_id UUID REFERENCES categories(id),
    due_day INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31), -- Day of month it's usually due
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Security Policies for Subscriptions (RLS)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Helper to apply policies (assuming the helper from 001 exists, but writing explicit policies to be safe and standalone)

-- SELECT
DROP POLICY IF EXISTS "users_select_own_subscriptions" ON subscriptions;
CREATE POLICY "users_select_own_subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- INSERT
DROP POLICY IF EXISTS "users_insert_own_subscriptions" ON subscriptions;
CREATE POLICY "users_insert_own_subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE
DROP POLICY IF EXISTS "users_update_own_subscriptions" ON subscriptions;
CREATE POLICY "users_update_own_subscriptions" ON subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- DELETE
DROP POLICY IF EXISTS "users_delete_own_subscriptions" ON subscriptions;
CREATE POLICY "users_delete_own_subscriptions" ON subscriptions
    FOR DELETE USING (auth.uid() = user_id);


-- 4. Trigger for updated_at on subscriptions
-- Reusing the function from 001_security_policies if available, or recreating if safe.
-- We'll assume the function public.update_updated_at_column exists from previous migration.
-- If not, we can recreate it, but it's better to just add the trigger if the function exists.

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE TRIGGER set_updated_at_subscriptions
        BEFORE UPDATE ON subscriptions
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;
