-- Schema V3: Arquitetura Single-User Simplificada
-- Cada usuário tem seus dados completamente isolados

-- ============================================================================
-- 1. LIMPEZA: Dropar Schema Antigo (Organizations)
-- ============================================================================

-- Dropar policies antigas
DROP POLICY IF EXISTS "Members can view organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can view orgs they belong to" ON public.organizations;
DROP POLICY IF EXISTS "Owners can update organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can view their memberships" ON public.memberships;
DROP POLICY IF EXISTS "Users manage own memberships" ON public.memberships;
DROP POLICY IF EXISTS "Members can view cards" ON public.cards;
DROP POLICY IF EXISTS "Members can manage cards" ON public.cards;
DROP POLICY IF EXISTS "Members can view categories" ON public.categories;
DROP POLICY IF EXISTS "Members can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Members can view transactions" ON public.transactions;
DROP POLICY IF EXISTS "Members can manage transactions" ON public.transactions;
DROP POLICY IF EXISTS "Members can view/manage splits" ON public.transaction_splits;
DROP POLICY IF EXISTS "Members can view/manage attachments" ON public.attachments;

-- Dropar triggers
DROP TRIGGER IF EXISTS on_org_created ON public.organizations;
DROP FUNCTION IF EXISTS public.create_membership_on_org_create() CASCADE;

-- Dropar tabelas complexas (ordem importante por FKs)
DROP TABLE IF EXISTS public.attachments CASCADE;
DROP TABLE IF EXISTS public.transaction_splits CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.cards CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.memberships CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;

-- ============================================================================
-- 2. CRIAR TABELAS SIMPLIFICADAS (User-Scoped)
-- ============================================================================

-- Categorias de gastos (personalizadas por usuário)
CREATE TABLE public.categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  
  name text NOT NULL,
  icon text DEFAULT '📦',
  color text DEFAULT 'slate',
  
  created_at timestamptz DEFAULT now()
);

-- Cartões de crédito do usuário
CREATE TABLE public.cards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  
  name text NOT NULL, -- Ex: "Nubank Mastercard"
  last_four text, -- Últimos 4 dígitos
  color text DEFAULT 'purple',
  
  closing_day int CHECK (closing_day BETWEEN 1 AND 31),
  due_day int CHECK (due_day BETWEEN 1 AND 31),
  
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Transações financeiras
CREATE TABLE public.transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  
  card_id uuid REFERENCES public.cards ON DELETE SET NULL,
  category_id uuid REFERENCES public.categories ON DELETE SET NULL,
  
  description text NOT NULL,
  amount_cents int NOT NULL, -- Armazena centavos (R$ 10,00 = 1000)
  currency text DEFAULT 'BRL',
  posted_at timestamptz NOT NULL DEFAULT now(), -- Data da compra
  
  installments int DEFAULT 1,
  installment_number int DEFAULT 1,
  
  imported boolean DEFAULT false,
  reconciled boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_categories_user ON public.categories(user_id);
CREATE INDEX idx_cards_user ON public.cards(user_id);
CREATE INDEX idx_transactions_user ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(posted_at DESC);
CREATE INDEX idx_transactions_card ON public.transactions(card_id);

-- ============================================================================
-- 3. HABILITAR RLS (Row Level Security)
-- ============================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. CRIAR POLICIES SIMPLES (user_id = auth.uid())
-- ============================================================================

-- Categories: Usuários gerenciam suas próprias categorias
CREATE POLICY "Users manage own categories" 
ON public.categories
FOR ALL 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Cards: Usuários gerenciam seus próprios cartões
CREATE POLICY "Users manage own cards" 
ON public.cards
FOR ALL 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Transactions: Usuários gerenciam suas próprias transações
CREATE POLICY "Users manage own transactions" 
ON public.transactions
FOR ALL 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 5. INSERIR CATEGORIAS PADRÃO (Opcional - pode ser feito no app)
-- ============================================================================

-- Função para criar categorias padrão para novos usuários
CREATE OR REPLACE FUNCTION public.create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.categories (user_id, name, icon, color) VALUES
    (NEW.id, 'Alimentação', '🍔', 'orange'),
    (NEW.id, 'Transporte', '🚗', 'blue'),
    (NEW.id, 'Moradia', '🏠', 'green'),
    (NEW.id, 'Saúde', '🏥', 'red'),
    (NEW.id, 'Lazer', '🎮', 'purple'),
    (NEW.id, 'Educação', '📚', 'indigo'),
    (NEW.id, 'Outros', '📦', 'slate');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar categorias quando usuário se cadastra
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_categories();

-- ============================================================================
-- 6. GRANTS (Permissões para role authenticated)
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.categories TO authenticated;
GRANT ALL ON public.cards TO authenticated;
GRANT ALL ON public.transactions TO authenticated;

-- ============================================================================
-- CONCLUÍDO: Schema V3 - Single User
-- ============================================================================

-- Verificar tabelas criadas
SELECT 
  tablename, 
  rowsecurity AS rls_enabled 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('categories', 'cards', 'transactions')
ORDER BY tablename;
