
-- ORDEM 1: REMOVER A POLÍTICA ANTIGA E INCORRETA
DROP POLICY IF EXISTS "Team owners can manage their teams" ON public.teams;
DROP POLICY IF EXISTS "Team members can view their teams" ON public.teams;

-- ORDEM 2: CRIAR AS NOVAS POLÍTICAS CORRIGIDAS

-- Política de Visualização: Permite que um utilizador veja as equipas das quais é membro.
CREATE POLICY "Team members can view their teams"
  ON public.teams FOR SELECT
  USING ( is_team_member(id, auth.uid()) );

-- Política de Criação: Permite que qualquer utilizador autenticado crie uma nova equipa.
-- A cláusula WITH CHECK garante que ele se defina como o dono.
CREATE POLICY "Authenticated users can create teams"
  ON public.teams FOR INSERT
  WITH CHECK ( owner_id = auth.uid() );

-- Política de Modificação: Apenas o dono da equipa pode atualizá-la ou excluí-la.
CREATE POLICY "Team owners can update and delete their teams"
  ON public.teams FOR UPDATE, DELETE
  USING ( owner_id = auth.uid() );
