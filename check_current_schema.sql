-- =====================================================
-- VERIFICAÇÃO RÁPIDA: Qual schema está ativo?
-- =====================================================
-- Execute isso no Supabase SQL Editor ANTES de rodar o schema completo

-- 1. Ver quais tabelas existem
SELECT 'TABELAS ATUAIS:' as info;
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Se você vê "memberships" ou "organizations" = SCHEMA ANTIGO (errado)
-- 3. Se você vê apenas "categories", "cards", "transactions", "user_settings", "income_entries" = SCHEMA NOVO (correto)

-- =====================================================
-- PRÓXIMO PASSO:
-- =====================================================
-- Se viu "memberships" → Execute supabase_complete_schema.sql
-- Se viu apenas as 5 tabelas corretas → Problema está em RLS ou autenticação
-- =====================================================
