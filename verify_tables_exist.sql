-- Quick verification: Check if tables exist
-- Run this in Supabase SQL Editor to see current state

SELECT 
    tablename,
    schemaname
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('categories', 'cards', 'transactions', 'user_settings', 'income_entries')
ORDER BY tablename;

-- If you see 0 rows, it means the schema hasn't been executed yet
-- In that case, run the complete schema: supabase_complete_schema.sql
