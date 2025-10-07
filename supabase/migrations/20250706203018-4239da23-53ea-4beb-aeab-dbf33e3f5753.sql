
-- ORDEM 1: REMOVER TODAS AS POLÍTICAS ANTIGAS PARA GARANTIR UM AMBIENTE LIMPO
DROP POLICY IF EXISTS "Team owners can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can insert into their own teams" ON public.team_members;
DROP POLICY IF EXISTS "Users can view members of teams they own" ON public.team_members;
DROP POLICY IF EXISTS "Team members can view other team members" ON public.team_members;
-- Políticas de versões anteriores que também podem existir
DROP POLICY IF EXISTS "Team members can view team membership" ON public.team_members;
DROP POLICY IF EXISTS "Team admins can manage team membership" ON public.team_members;

-- ORDEM 2: CRIAR AS NOVAS POLÍTICAS CORRIGIDAS

-- POLÍTICA DE VISUALIZAÇÃO (SELECT):
-- Permite que um usuário veja todos os membros de uma equipe SE ele mesmo for membro daquela equipe.
-- Esta é a política chave para permitir que Coordenadores vejam a lista de membros.
CREATE POLICY "Team members can view their own team's members" ON public.team_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id AND tm.user_id = auth.uid()
    )
  );

-- POLÍTICA DE INSERÇÃO (INSERT):
-- Permite que apenas o DONO da equipe possa convidar/adicionar novos membros.
-- Esta é a forma mais segura de controlar quem entra na equipe.
CREATE POLICY "Team owners can add new members" ON public.team_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.teams t
      WHERE t.id = team_members.team_id AND t.owner_id = auth.uid()
    )
  );

-- POLÍTICA DE MODIFICAÇÃO (UPDATE & DELETE):
-- Permite que apenas o DONO da equipe possa alterar funções ou remover membros.
-- Isso impede que um Coordenador remova o Admin ou outros membros.
CREATE POLICY "Team owners can update and delete members" ON public.team_members
  FOR UPDATE, DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.teams t
      WHERE t.id = team_members.team_id AND t.owner_id = auth.uid()
    )
  );
