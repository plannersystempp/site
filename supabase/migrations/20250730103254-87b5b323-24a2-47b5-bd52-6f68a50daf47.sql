-- ORDEM 1: REMOVER TODAS AS POLÍTICAS ANTIGAS DA TABELA 'teams' PARA EVITAR CONFLITOS
DROP POLICY IF EXISTS "Team members can view their teams" ON public.teams;
DROP POLICY IF EXISTS "Team owners can manage their teams" ON public.teams;
DROP POLICY IF EXISTS "Authenticated users can create teams" ON public.teams;
DROP POLICY IF EXISTS "Team owners can update and delete their teams" ON public.teams;

-- ORDEM 2: CRIAR O NOVO CONJUNTO DE POLÍTICAS CORRIGIDO E SEGURO

-- Política de VISUALIZAÇÃO (SELECT):
-- Permite que um usuário veja as equipes das quais ele é membro.
CREATE POLICY "Team members can view their teams"
  ON public.teams FOR SELECT
  USING ( is_team_member(id, auth.uid()) );

-- Política de CRIAÇÃO (INSERT):
-- Permite que QUALQUER usuário autenticado possa criar uma nova equipe.
-- A cláusula WITH CHECK é a chave: ela garante que o usuário que está a criar
-- a equipe se defina OBRIGATORIAMENTE como o dono (owner_id).
CREATE POLICY "Authenticated users can create their own team"
  ON public.teams FOR INSERT
  WITH CHECK ( owner_id = auth.uid() );

-- Política de MODIFICAÇÃO (UPDATE, DELETE):
-- Permite que apenas o dono da equipe possa alterar o nome ou excluí-la.
CREATE POLICY "Team owners can update and delete their own team"
  ON public.teams FOR UPDATE
  USING ( owner_id = auth.uid() );

CREATE POLICY "Team owners can delete their own team"
  ON public.teams FOR DELETE
  USING ( owner_id = auth.uid() );