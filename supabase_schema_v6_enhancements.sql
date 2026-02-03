-- Migration V6: Enhanced Financial Control Features
-- Run this SQL in your Supabase SQL Editor
-- Description: Adds weekly goals, card invoice configuration, and category protection

-- =====================================================
-- 1. Add weekly goal to user_settings
-- =====================================================
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS weekly_goal_cents INTEGER DEFAULT 0;

COMMENT ON COLUMN user_settings.weekly_goal_cents IS 'Weekly spending goal in cents (independent from monthly budget)';

-- =====================================================
-- 2. Enhance cards table with invoice configuration
-- =====================================================
ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS closing_days_before INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS due_day INTEGER DEFAULT 10;

COMMENT ON COLUMN cards.closing_days_before IS 'Number of days before due date that the invoice closes';
COMMENT ON COLUMN cards.due_day IS 'Day of month when invoice is due (1-31)';

-- Note: closing_day is calculated as (due_day - closing_days_before)
-- This will be computed in application logic to handle month boundaries

-- =====================================================
-- 3. Category protection: prevent deletion if used
-- =====================================================
CREATE OR REPLACE FUNCTION prevent_category_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if category has any transactions
  IF EXISTS (
    SELECT 1 
    FROM transactions 
    WHERE category_id = OLD.id 
    LIMIT 1
  ) THEN
    RAISE EXCEPTION 'Cannot delete category with existing transactions. Please reassign transactions first.';
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists (for re-running migration)
DROP TRIGGER IF EXISTS category_delete_protection ON categories;

-- Create trigger
CREATE TRIGGER category_delete_protection
BEFORE DELETE ON categories
FOR EACH ROW 
EXECUTE FUNCTION prevent_category_delete();

COMMENT ON FUNCTION prevent_category_delete() IS 'Prevents deletion of categories that have associated transactions';

-- =====================================================
-- 4. Update RLS policies (if needed)
-- =====================================================
-- Ensure users can update their own card settings
-- This should already be covered by existing policies, but we'll verify

-- Verify card update policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cards' 
    AND policyname = 'Users can update own cards'
  ) THEN
    CREATE POLICY "Users can update own cards"
      ON cards
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- =====================================================
-- 5. Verification queries
-- =====================================================
-- Run these to verify migration success:

-- Check new columns exist
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'user_settings' AND column_name = 'weekly_goal_cents';

-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'cards' AND column_name IN ('closing_days_before', 'due_day');

-- Check trigger exists
-- SELECT trigger_name, event_manipulation, event_object_table 
-- FROM information_schema.triggers 
-- WHERE trigger_name = 'category_delete_protection';

-- =====================================================
-- Migration complete!
-- =====================================================
