
-- Criar tabela para gerenciar aprovações de usuários
CREATE TABLE IF NOT EXISTS public.user_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela de aprovações
ALTER TABLE public.user_approvals ENABLE ROW LEVEL SECURITY;

-- Política para todos verem suas próprias aprovações
CREATE POLICY "Users can view their own approval status" ON public.user_approvals
  FOR SELECT USING (user_id::text = auth.uid()::text);

-- Política para inserir aprovações (será usado no código)
CREATE POLICY "Anyone can insert approval requests" ON public.user_approvals
  FOR INSERT WITH CHECK (true);

-- Política para admins gerenciarem todas as aprovações
CREATE POLICY "Admins can manage all approvals" ON public.user_approvals
  FOR ALL USING (
    auth.uid()::text IN (
      SELECT user_id::text FROM public.user_approvals 
      WHERE status = 'approved' AND user_id::text = auth.uid()::text
      LIMIT 1
    ) OR 
    auth.jwt() ->> 'email' = 'admin@example.com'
  );

-- Adicionar descrição na tabela de funções se não existir
ALTER TABLE public.functions ADD COLUMN IF NOT EXISTS description TEXT;

-- Criar tabela para armazenar perfis de usuário com roles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela de perfis
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem seu próprio perfil
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (user_id = auth.uid());

-- Política para admins verem todos os perfis
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() AND up.role = 'admin' AND up.is_approved = true
    )
  );
