-- ============================================
-- CORREÇÃO: RLS para permitir coordenadores visualizarem personnel
-- ============================================

-- Drop política existente que pode estar bloqueando coordenadores
DROP POLICY IF EXISTS "Members can view personnel of their team" ON public.personnel;

-- Recriar política permitindo visualização por membros aprovados da equipe (incluindo coordenadores)
CREATE POLICY "Members can view personnel of their team"
ON public.personnel
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = personnel.team_id
    AND tm.user_id = auth.uid()
    AND tm.status = 'approved'
  )
  OR
  public.is_super_admin()
);

-- Garantir que a política para INSERT também funciona corretamente
DROP POLICY IF EXISTS "Members can insert personnel for their team" ON public.personnel;

CREATE POLICY "Members can insert personnel for their team"
ON public.personnel
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = personnel.team_id
    AND tm.user_id = auth.uid()
    AND tm.status = 'approved'
    AND tm.role IN ('admin', 'coordinator')
  )
  OR
  public.is_super_admin()
);

-- Garantir política UPDATE
DROP POLICY IF EXISTS "Admins can update personnel of their team" ON public.personnel;

CREATE POLICY "Admins can update personnel of their team"
ON public.personnel
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = personnel.team_id
    AND tm.user_id = auth.uid()
    AND tm.status = 'approved'
    AND tm.role = 'admin'
  )
  OR
  public.is_super_admin()
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = personnel.team_id
    AND tm.user_id = auth.uid()
    AND tm.status = 'approved'
    AND tm.role = 'admin'
  )
  OR
  public.is_super_admin()
);

-- Adicionar comentários para documentação
COMMENT ON POLICY "Members can view personnel of their team" ON public.personnel IS 
'Permite que membros aprovados da equipe (admins e coordenadores) vejam o pessoal da sua equipe';

COMMENT ON POLICY "Members can insert personnel for their team" ON public.personnel IS 
'Permite que admins e coordenadores cadastrem pessoal na sua equipe';

COMMENT ON POLICY "Admins can update personnel of their team" ON public.personnel IS 
'Apenas admins podem atualizar dados de pessoal da sua equipe';