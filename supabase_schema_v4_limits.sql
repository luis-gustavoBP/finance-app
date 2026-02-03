-- Schema V4: Limites de Cartões e Orçamento Global

-- 1. Adicionar coluna de limite à tabela de cartões
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS limit_cents int DEFAULT 0;

-- 2. Criar tabela de configurações do usuário para o Orçamento Global
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  global_monthly_limit_cents int DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- 3. Habilitar RLS para user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- 4. Criar policy para user_settings
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_settings' AND policyname = 'Users manage own settings'
    ) THEN
        CREATE POLICY "Users manage own settings" ON public.user_settings
        FOR ALL TO authenticated
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

-- 5. Função para criar settings padrão para novos usuários
CREATE OR REPLACE FUNCTION public.create_default_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id, global_monthly_limit_cents)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger para criar settings quando usuário se cadastra (ou se já existir, garantir que tenha settings)
DROP TRIGGER IF EXISTS on_auth_user_created_settings ON auth.users;
CREATE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_settings();

-- 7. Garantir permissões
GRANT ALL ON public.user_settings TO authenticated;

-- 8. Inserir settings para usuários existentes (opcional, mas recomendado)
INSERT INTO public.user_settings (user_id, global_monthly_limit_cents)
SELECT id, 0 FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
