-- Migration: Income Entries (Entradas de Dinheiro)
-- Run this SQL in your Supabase SQL Editor
-- Description: Creates table for tracking income/money received (non-regular income)

-- =====================================================
-- 1. Create income_entries table
-- =====================================================
CREATE TABLE IF NOT EXISTS income_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
    received_at DATE NOT NULL DEFAULT CURRENT_DATE,
    type TEXT NOT NULL CHECK (type IN ('extra', 'reembolso', 'presente', 'freelance', 'bonus', 'outros')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE income_entries IS 'Records of non-regular income (windfalls, gifts, reimbursements, etc.)';
COMMENT ON COLUMN income_entries.amount_cents IS 'Amount received in cents';
COMMENT ON COLUMN income_entries.type IS 'Type: extra, reembolso, presente, freelance, bonus, outros';

-- =====================================================
-- 2. Create indexes for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_income_entries_user_id ON income_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_income_entries_received_at ON income_entries(received_at);
CREATE INDEX IF NOT EXISTS idx_income_entries_user_received ON income_entries(user_id, received_at DESC);

-- =====================================================
-- 3. Enable Row Level Security
-- =====================================================
ALTER TABLE income_entries ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. Create RLS Policies
-- =====================================================

-- Users can view their own income entries
DROP POLICY IF EXISTS "Users can view own income entries" ON income_entries;
CREATE POLICY "Users can view own income entries"
    ON income_entries
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own income entries
DROP POLICY IF EXISTS "Users can insert own income entries" ON income_entries;
CREATE POLICY "Users can insert own income entries"
    ON income_entries
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own income entries
DROP POLICY IF EXISTS "Users can update own income entries" ON income_entries;
CREATE POLICY "Users can update own income entries"
    ON income_entries
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own income entries
DROP POLICY IF EXISTS "Users can delete own income entries" ON income_entries;
CREATE POLICY "Users can delete own income entries"
    ON income_entries
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 5. Verification queries
-- =====================================================
-- Run these to verify migration success:

-- Check table exists
-- SELECT table_name, table_type 
-- FROM information_schema.tables 
-- WHERE table_name = 'income_entries';

-- Check columns
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'income_entries';

-- Check policies
-- SELECT policyname, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE tablename = 'income_entries';

-- =====================================================
-- Migration complete!
-- =====================================================
