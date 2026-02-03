-- =====================================================================
-- ContApp - Complete Database Schema
-- =====================================================================
-- Description: Complete database schema from scratch
-- Version: 1.0 (replaces all previous migrations)
-- 
-- WARNING: This script drops all existing tables and recreates them.
--          All data will be lost. Export data before running if needed.
-- =====================================================================

-- =====================================================================
-- SECTION 1: DROP EXISTING TABLES
-- =====================================================================

DROP TABLE IF EXISTS income_entries CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS create_installment_transactions CASCADE;
DROP FUNCTION IF EXISTS prevent_category_deletion CASCADE;

-- =====================================================================
-- SECTION 2: CREATE TABLES
-- =====================================================================

-- ---------------------------------------------------------------------
-- Table: categories
-- Purpose: Expense categories with custom icons and colors
-- ---------------------------------------------------------------------
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '📦',
    color TEXT NOT NULL DEFAULT '#6366f1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT categories_name_not_empty CHECK (length(trim(name)) > 0)
);

CREATE INDEX idx_categories_user_id ON categories(user_id);

COMMENT ON TABLE categories IS 'User-defined expense categories';
COMMENT ON COLUMN categories.icon IS 'Emoji icon for the category';
COMMENT ON COLUMN categories.color IS 'Hex color code for visual identification';

-- ---------------------------------------------------------------------
-- Table: cards
-- Purpose: Credit cards with invoice configuration
-- ---------------------------------------------------------------------
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    last_four TEXT,
    color TEXT NOT NULL DEFAULT '#6366f1',
    closing_day INTEGER,
    closing_days_before INTEGER NOT NULL DEFAULT 10,
    due_day INTEGER NOT NULL DEFAULT 10,
    is_active BOOLEAN NOT NULL DEFAULT true,
    limit_cents INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT cards_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT cards_last_four_length CHECK (last_four IS NULL OR length(last_four) = 4),
    CONSTRAINT cards_closing_days_before_range CHECK (closing_days_before >= 1 AND closing_days_before <= 30),
    CONSTRAINT cards_due_day_range CHECK (due_day >= 1 AND due_day <= 31),
    CONSTRAINT cards_limit_non_negative CHECK (limit_cents >= 0)
);

CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_cards_user_active ON cards(user_id, is_active);

COMMENT ON TABLE cards IS 'Credit cards with invoice billing configuration';
COMMENT ON COLUMN cards.closing_days_before IS 'Number of days before due date when invoice closes';
COMMENT ON COLUMN cards.due_day IS 'Day of month when invoice payment is due (1-31)';
COMMENT ON COLUMN cards.closing_day IS 'Legacy field - calculated closing day';
COMMENT ON COLUMN cards.limit_cents IS 'Card credit limit in cents';

-- ---------------------------------------------------------------------
-- Table: transactions
-- Purpose: All financial transactions (purchases, expenses)
-- ---------------------------------------------------------------------
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    posted_at DATE NOT NULL DEFAULT CURRENT_DATE,
    installments INTEGER NOT NULL DEFAULT 1,
    installment_number INTEGER NOT NULL DEFAULT 1,
    parent_transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT transactions_description_not_empty CHECK (length(trim(description)) > 0),
    CONSTRAINT transactions_amount_positive CHECK (amount_cents > 0),
    CONSTRAINT transactions_installments_positive CHECK (installments >= 1),
    CONSTRAINT transactions_installment_number_valid CHECK (
        installment_number >= 1 AND installment_number <= installments
    )
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_user_posted ON transactions(user_id, posted_at DESC);
CREATE INDEX idx_transactions_card ON transactions(card_id);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_parent ON transactions(parent_transaction_id);

COMMENT ON TABLE transactions IS 'All expense transactions including installments';
COMMENT ON COLUMN transactions.amount_cents IS 'Amount in cents for this specific transaction/installment';
COMMENT ON COLUMN transactions.installments IS 'Total number of installments for this purchase';
COMMENT ON COLUMN transactions.installment_number IS 'Which installment this is (1-based)';
COMMENT ON COLUMN transactions.parent_transaction_id IS 'Links installments to original purchase';

-- ---------------------------------------------------------------------
-- Table: user_settings
-- Purpose: User preferences and budget configuration
-- ---------------------------------------------------------------------
CREATE TABLE user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    global_monthly_limit_cents INTEGER NOT NULL DEFAULT 0,
    weekly_goal_cents INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT user_settings_monthly_limit_non_negative CHECK (global_monthly_limit_cents >= 0),
    CONSTRAINT user_settings_weekly_goal_non_negative CHECK (weekly_goal_cents >= 0)
);

COMMENT ON TABLE user_settings IS 'User budget preferences and goals';
COMMENT ON COLUMN user_settings.global_monthly_limit_cents IS 'Total monthly budget across all spending';
COMMENT ON COLUMN user_settings.weekly_goal_cents IS 'Weekly spending goal target';

-- ---------------------------------------------------------------------
-- Table: income_entries
-- Purpose: Non-regular income tracking (windfalls, gifts, etc.)
-- ---------------------------------------------------------------------
CREATE TABLE income_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    received_at DATE NOT NULL DEFAULT CURRENT_DATE,
    type TEXT NOT NULL CHECK (type IN ('extra', 'reembolso', 'presente', 'freelance', 'bonus', 'outros')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT income_entries_description_not_empty CHECK (length(trim(description)) > 0),
    CONSTRAINT income_entries_amount_positive CHECK (amount_cents > 0)
);

CREATE INDEX idx_income_entries_user_id ON income_entries(user_id);
CREATE INDEX idx_income_entries_user_received ON income_entries(user_id, received_at DESC);
CREATE INDEX idx_income_entries_type ON income_entries(type);

COMMENT ON TABLE income_entries IS 'Non-regular income (extra money received)';
COMMENT ON COLUMN income_entries.type IS 'Income type: extra, reembolso, presente, freelance, bonus, outros';
COMMENT ON COLUMN income_entries.notes IS 'Optional additional notes';

-- =====================================================================
-- SECTION 3: ROW LEVEL SECURITY (RLS)
-- =====================================================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_entries ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- RLS Policies: categories
-- ---------------------------------------------------------------------
CREATE POLICY "Users can view own categories"
    ON categories FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
    ON categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
    ON categories FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
    ON categories FOR DELETE
    USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- RLS Policies: cards
-- ---------------------------------------------------------------------
CREATE POLICY "Users can view own cards"
    ON cards FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cards"
    ON cards FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards"
    ON cards FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cards"
    ON cards FOR DELETE
    USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- RLS Policies: transactions
-- ---------------------------------------------------------------------
CREATE POLICY "Users can view own transactions"
    ON transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
    ON transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
    ON transactions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
    ON transactions FOR DELETE
    USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- RLS Policies: user_settings
-- ---------------------------------------------------------------------
CREATE POLICY "Users can view own settings"
    ON user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
    ON user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
    ON user_settings FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
    ON user_settings FOR DELETE
    USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- RLS Policies: income_entries
-- ---------------------------------------------------------------------
CREATE POLICY "Users can view own income entries"
    ON income_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own income entries"
    ON income_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own income entries"
    ON income_entries FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own income entries"
    ON income_entries FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================================
-- SECTION 4: TRIGGERS
-- =====================================================================

-- ---------------------------------------------------------------------
-- Trigger: Prevent category deletion if transactions exist
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION prevent_category_deletion()
RETURNS TRIGGER AS $$
DECLARE
    transaction_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO transaction_count
    FROM transactions
    WHERE category_id = OLD.id;
    
    IF transaction_count > 0 THEN
        RAISE EXCEPTION 'Cannot delete category with existing transactions. Found % transaction(s).', transaction_count;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER category_delete_protection
    BEFORE DELETE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION prevent_category_deletion();

COMMENT ON FUNCTION prevent_category_deletion() IS 'Prevents deletion of categories that have linked transactions';

-- =====================================================================
-- SECTION 5: RPC FUNCTIONS
-- =====================================================================

-- ---------------------------------------------------------------------
-- Function: Create installment transactions
-- Purpose: Creates linked installment records for a purchase
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_installment_transactions(
    p_user_id UUID,
    p_card_id UUID,
    p_category_id UUID,
    p_description TEXT,
    p_total_amount_cents INTEGER,
    p_installments INTEGER,
    p_first_date DATE
)
RETURNS SETOF transactions AS $$
DECLARE
    v_installment_amount INTEGER;
    v_parent_id UUID;
    v_transaction transactions;
BEGIN
    -- Validate inputs
    IF p_installments < 1 THEN
        RAISE EXCEPTION 'Number of installments must be at least 1';
    END IF;
    
    IF p_total_amount_cents <= 0 THEN
        RAISE EXCEPTION 'Total amount must be positive';
    END IF;
    
    -- Calculate installment amount
    v_installment_amount := p_total_amount_cents / p_installments;
    
    -- Create installment transactions
    FOR i IN 1..p_installments LOOP
        -- First installment becomes the parent
        IF i = 1 THEN
            INSERT INTO transactions (
                user_id,
                card_id,
                category_id,
                description,
                amount_cents,
                posted_at,
                installments,
                installment_number,
                parent_transaction_id
            ) VALUES (
                p_user_id,
                p_card_id,
                p_category_id,
                p_description,
                v_installment_amount,
                p_first_date,
                p_installments,
                1,
                NULL
            )
            RETURNING * INTO v_transaction;
            
            v_parent_id := v_transaction.id;
            RETURN NEXT v_transaction;
        ELSE
            -- Subsequent installments reference the parent
            INSERT INTO transactions (
                user_id,
                card_id,
                category_id,
                description,
                amount_cents,
                posted_at,
                installments,
                installment_number,
                parent_transaction_id
            ) VALUES (
                p_user_id,
                p_card_id,
                p_category_id,
                p_description,
                v_installment_amount,
                p_first_date + INTERVAL '1 month' * (i - 1),
                p_installments,
                i,
                v_parent_id
            )
            RETURNING * INTO v_transaction;
            
            RETURN NEXT v_transaction;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_installment_transactions IS 'Creates linked installment transaction records';

-- =====================================================================
-- SECTION 6: VERIFICATION QUERIES
-- =====================================================================

-- Verify tables were created
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('categories', 'cards', 'transactions', 'user_settings', 'income_entries');
    
    RAISE NOTICE '✓ Created % tables', table_count;
    
    IF table_count != 5 THEN
        RAISE WARNING 'Expected 5 tables, found %', table_count;
    END IF;
END $$;

-- Verify RLS is enabled
DO $$
DECLARE
    rls_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO rls_count
    FROM pg_tables
    WHERE schemaname = 'public'
    AND rowsecurity = true
    AND tablename IN ('categories', 'cards', 'transactions', 'user_settings', 'income_entries');
    
    RAISE NOTICE '✓ RLS enabled on % tables', rls_count;
    
    IF rls_count != 5 THEN
        RAISE WARNING 'Expected RLS on 5 tables, found %', rls_count;
    END IF;
END $$;

-- Verify policies were created
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public';
    
    RAISE NOTICE '✓ Created % RLS policies', policy_count;
    
    IF policy_count < 20 THEN
        RAISE WARNING 'Expected at least 20 policies (4 per table × 5 tables), found %', policy_count;
    END IF;
END $$;

-- =====================================================================
-- MIGRATION COMPLETE
-- =====================================================================

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✓ Database schema created successfully!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '  • categories';
    RAISE NOTICE '  • cards';
    RAISE NOTICE '  • transactions';
    RAISE NOTICE '  • user_settings';
    RAISE NOTICE '  • income_entries';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Verify the output above shows no warnings';
    RAISE NOTICE '  2. Test frontend connectivity';
    RAISE NOTICE '  3. Create test data if needed';
    RAISE NOTICE '';
END $$;
