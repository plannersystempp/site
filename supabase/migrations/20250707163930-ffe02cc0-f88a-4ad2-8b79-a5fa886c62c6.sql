
-- ================================
-- PASSO 1: LIMPEZA TOTAL DAS POLÍTICAS PROBLEMÁTICAS
-- ================================

-- Remover TODAS as políticas da tabela team_members (incluindo as atuais problemáticas)
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
DROP POLICY IF EXISTS "team_members_select_policy" ON public.team_members;
DROP POLICY IF EXISTS "team_members_insert_policy" ON public.team_members;
DROP POLICY IF EXISTS "team_members_update_delete_policy" ON public.team_members;

-- Remover políticas problemáticas da tabela teams
DROP POLICY IF EXISTS "Team members can view their teams" ON public.teams;
DROP POLICY IF EXISTS "team_select_policy" ON public.teams;
DROP POLICY IF EXISTS "Users can view teams they belong to" ON public.teams;

-- ================================
-- PASSO 2: RECRIAR FUNÇÃO SECURITY DEFINER
-- ================================

-- Remover função existente se houver
DROP FUNCTION IF EXISTS public.is_team_member(UUID, UUID);

-- Criar função security definer para evitar recursão
CREATE OR REPLACE FUNCTION public.is_team_member(check_team_id UUID, check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.team_members 
    WHERE team_id = check_team_id 
    AND user_id = check_user_id
  );
$$;

-- ================================
-- PASSO 3: RECRIAR POLÍTICAS RLS CORRETAS PARA TEAM_MEMBERS
-- ================================

-- Política SELECT: ver membros se for dono da equipe OU próprio registro
CREATE POLICY "team_members_select" ON public.team_members
  FOR SELECT
  USING (
    -- Dono da equipe pode ver todos os membros
    team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
    OR
    -- Usuário pode ver seu próprio registro de membro
    user_id = auth.uid()
  );

-- Política INSERT: apenas donos podem adicionar membros
CREATE POLICY "team_members_insert" ON public.team_members
  FOR INSERT
  WITH CHECK (
    team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
  );

-- Política UPDATE: apenas donos podem atualizar membros
CREATE POLICY "team_members_update" ON public.team_members
  FOR UPDATE
  USING (
    team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
  );

-- Política DELETE: apenas donos podem remover membros
CREATE POLICY "team_members_delete" ON public.team_members
  FOR DELETE
  USING (
    team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
  );

-- ================================
-- PASSO 4: RECRIAR POLÍTICAS RLS CORRETAS PARA TEAMS
-- ================================

-- Política SELECT: ver equipes onde é dono OU membro
CREATE POLICY "teams_select" ON public.teams
  FOR SELECT
  USING (
    -- Dono pode ver
    owner_id = auth.uid()
    OR
    -- Membro pode ver (usando função security definer)
    public.is_team_member(id, auth.uid())
  );

-- Política INSERT: usuários podem criar equipes
CREATE POLICY "teams_insert" ON public.teams
  FOR INSERT
  WITH CHECK (
    owner_id = auth.uid()
  );

-- Política UPDATE: apenas donos podem atualizar
CREATE POLICY "teams_update" ON public.teams
  FOR UPDATE
  USING (
    owner_id = auth.uid()
  );

-- Política DELETE: apenas donos podem deletar
CREATE POLICY "teams_delete" ON public.teams
  FOR DELETE
  USING (
    owner_id = auth.uid()
  );

-- ================================
-- PASSO 5: CORRIGIR POLÍTICAS DE OUTRAS TABELAS DEPENDENTES
-- ================================

-- Remover e recriar políticas para PERSONNEL
DROP POLICY IF EXISTS "Team admins can manage personnel" ON public.personnel;
DROP POLICY IF EXISTS "Users can view personnel from their teams" ON public.personnel;

CREATE POLICY "personnel_team_access" ON public.personnel
  FOR ALL
  USING (
    -- Donos de equipe podem gerenciar
    team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
    OR
    -- Membros podem ver (usando função security definer)
    team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
  );

-- Remover e recriar políticas para EVENTS
DROP POLICY IF EXISTS "Team admins can manage events" ON public.events;
DROP POLICY IF EXISTS "Users can view events from their teams" ON public.events;

CREATE POLICY "events_team_access" ON public.events
  FOR ALL
  USING (
    -- Donos de equipe podem gerenciar
    team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
    OR
    -- Membros podem ver (usando função security definer)
    team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
  );

-- Remover e recriar políticas para FUNCTIONS
DROP POLICY IF EXISTS "Team admins can manage functions" ON public.functions;
DROP POLICY IF EXISTS "Users can view functions from their teams" ON public.functions;

CREATE POLICY "functions_team_access" ON public.functions
  FOR ALL
  USING (
    -- Donos de equipe podem gerenciar
    team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
    OR
    -- Membros podem ver (usando função security definer)
    team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
  );

-- ================================
-- PASSO 6: VERIFICAR E VALIDAR ESTRUTURA
-- ================================

-- Garantir que RLS está habilitado em todas as tabelas
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.functions ENABLE ROW LEVEL SECURITY;
