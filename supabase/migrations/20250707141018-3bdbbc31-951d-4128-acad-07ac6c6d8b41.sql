
-- Remover TODAS as políticas problemáticas da tabela team_members
DROP POLICY IF EXISTS "Team members can view their own team's members" ON public.team_members;
DROP POLICY IF EXISTS "Team owners can add new members" ON public.team_members;
DROP POLICY IF EXISTS "Team owners can update and delete members" ON public.team_members;
DROP POLICY IF EXISTS "Team members can view team membership" ON public.team_members;
DROP POLICY IF EXISTS "Team owners and admins can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can insert team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can view team members of their teams" ON public.team_members;

-- Criar políticas mais simples e sem recursão
-- Política para SELECT: permite ver membros se o usuário é dono da equipe OU se é o próprio membro
CREATE POLICY "Simple team members select" ON public.team_members
  FOR SELECT
  USING (
    -- O usuário pode ver se é dono da equipe
    team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
    OR
    -- O usuário pode ver sua própria participação
    user_id = auth.uid()
  );

-- Política para INSERT: apenas donos de equipe podem adicionar membros
CREATE POLICY "Team owners can insert members" ON public.team_members
  FOR INSERT
  WITH CHECK (
    team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
  );

-- Política para UPDATE/DELETE: apenas donos de equipe podem modificar membros
CREATE POLICY "Team owners can modify members" ON public.team_members
  FOR UPDATE, DELETE
  USING (
    team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
  );
