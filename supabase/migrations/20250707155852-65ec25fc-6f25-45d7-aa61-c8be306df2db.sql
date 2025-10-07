
-- PASSO 1: Remover TODAS as políticas problemáticas da tabela team_members
DROP POLICY IF EXISTS "Team members can view their own team's members" ON public.team_members;
DROP POLICY IF EXISTS "Team owners can add new members" ON public.team_members;
DROP POLICY IF EXISTS "Team owners can update and delete members" ON public.team_members;
DROP POLICY IF EXISTS "Team members can view team membership" ON public.team_members;
DROP POLICY IF EXISTS "Team owners and admins can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can insert team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can view team members of their teams" ON public.team_members;
DROP POLICY IF EXISTS "Simple team members select" ON public.team_members;
DROP POLICY IF EXISTS "Team owners can insert members" ON public.team_members;
DROP POLICY IF EXISTS "Team owners can modify members" ON public.team_members;

-- PASSO 2: Criar a função is_team_member se não existir (necessária para as políticas de teams)
CREATE OR REPLACE FUNCTION public.is_team_member(team_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.team_members 
    WHERE team_members.team_id = $1 
    AND team_members.user_id = $2
  );
$$;

-- PASSO 3: Criar políticas RLS simples e funcionais para team_members
-- Política SELECT: usuário pode ver membros se for dono da equipe OU se for o próprio usuário
CREATE POLICY "team_members_select_policy" ON public.team_members
  FOR SELECT
  USING (
    -- Ver se é dono da equipe (sem recursão)
    team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
    OR
    -- Ver própria participação
    user_id = auth.uid()
  );

-- Política INSERT: apenas donos podem adicionar membros
CREATE POLICY "team_members_insert_policy" ON public.team_members
  FOR INSERT
  WITH CHECK (
    team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
  );

-- Política UPDATE/DELETE: apenas donos podem modificar membros
CREATE POLICY "team_members_update_delete_policy" ON public.team_members
  FOR UPDATE, DELETE
  USING (
    team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
  );

-- PASSO 4: Verificar e corrigir políticas da tabela teams se necessário
-- Remover política problemática se existir
DROP POLICY IF EXISTS "Team members can view their teams" ON public.teams;

-- Recriar política corrigida para teams
CREATE POLICY "team_select_policy" ON public.teams
  FOR SELECT
  USING (
    -- Dono pode ver
    owner_id = auth.uid()
    OR
    -- Membro pode ver (usando função security definer)
    public.is_team_member(id, auth.uid())
  );
