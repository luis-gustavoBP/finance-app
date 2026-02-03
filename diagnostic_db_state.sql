-- =====================================================
-- DIAGNOSTIC: Current Database State
-- =====================================================
-- Run this to understand what's happening

-- 1. Check which tables exist
SELECT '=== TABLES ===' as status;
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Check RLS status
SELECT '=== RLS STATUS ===' as status;
SELECT 
    tablename,
    CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. Check policies count
SELECT '=== POLICIES ===' as status;
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- 4. Check if functions exist
SELECT '=== FUNCTIONS ===' as status;
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('create_installment_transactions', 'prevent_category_deletion')
ORDER BY routine_name;

-- =====================================================
-- WHAT TO DO BASED ON RESULTS:
-- =====================================================
-- If you see NO TABLES or MISSING TABLES:
--   → Run supabase_complete_schema.sql
--
-- If you see ALL 5 TABLES but frontend still errors:
--   → Clear browser cache (Ctrl+Shift+R)
--   → Restart dev server
--
-- If you see SOME TABLES but not all:
--   → Run supabase_complete_schema.sql (it will drop and recreate)
-- =====================================================
