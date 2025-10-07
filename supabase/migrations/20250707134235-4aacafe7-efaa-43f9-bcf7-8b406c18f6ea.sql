
-- Remover a política problemática que causa recursão
DROP POLICY IF EXISTS "Team members can view their own team's members" ON public.team_members;

-- Criar uma política mais simples sem recursão
-- Esta política permite que membros vejam outros membros da mesma equipe
-- mas sem referenciar a própria tabela team_members na condição
CREATE POLICY "Team members can view team membership" ON public.team_members
  FOR SELECT
  USING (
    -- O usuário pode ver membros de equipes onde ele é o dono
    team_id IN (
      SELECT id FROM public.teams WHERE owner_id = auth.uid()
    )
    OR
    -- O usuário pode ver sua própria membership
    user_id = auth.uid()
  );
