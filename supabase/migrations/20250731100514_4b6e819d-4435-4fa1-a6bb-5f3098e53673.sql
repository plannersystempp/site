-- Primeiro, criar as funções auxiliares necessárias

-- Função para verificar se o usuário atual é membro de uma equipe
CREATE OR REPLACE FUNCTION public.is_team_member(check_team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.team_members 
    WHERE team_id = check_team_id 
    AND user_id = auth.uid()
    AND status = 'approved'
  );
$$;

-- Função para obter a role do usuário atual em uma equipe
CREATE OR REPLACE FUNCTION public.get_user_role_in_team(check_team_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT role 
  FROM public.team_members 
  WHERE team_id = check_team_id 
  AND user_id = auth.uid()
  AND status = 'approved'
  LIMIT 1;
$$;

-- Agora criar as políticas RLS para cada tabela

-- Tabela: user_profiles
CREATE POLICY "Usuários podem ver e atualizar seu próprio perfil"
ON public.user_profiles FOR ALL
USING ( auth.uid() = user_id );

-- Tabela: team_members
CREATE POLICY "Membros podem ver membros de suas equipes"
ON public.team_members FOR SELECT
USING ( is_team_member(team_id) );

CREATE POLICY "Admins podem inserir membros de sua equipe"
ON public.team_members FOR INSERT
WITH CHECK ( get_user_role_in_team(team_id) = 'admin' );

CREATE POLICY "Admins podem atualizar membros de sua equipe"
ON public.team_members FOR UPDATE
USING ( get_user_role_in_team(team_id) = 'admin' );

CREATE POLICY "Admins podem deletar membros de sua equipe"
ON public.team_members FOR DELETE
USING ( get_user_role_in_team(team_id) = 'admin' );

-- Tabela: events
CREATE POLICY "Membros da equipe podem visualizar eventos"
ON public.events FOR SELECT
USING ( is_team_member(team_id) );

CREATE POLICY "Admins da equipe podem inserir eventos"
ON public.events FOR INSERT
WITH CHECK ( get_user_role_in_team(team_id) = 'admin' );

CREATE POLICY "Admins da equipe podem atualizar eventos"
ON public.events FOR UPDATE
USING ( get_user_role_in_team(team_id) = 'admin' );

CREATE POLICY "Admins da equipe podem deletar eventos"
ON public.events FOR DELETE
USING ( get_user_role_in_team(team_id) = 'admin' );

-- Tabela: personnel
CREATE POLICY "Membros da equipe podem visualizar o pessoal"
ON public.personnel FOR SELECT
USING ( is_team_member(team_id) );

CREATE POLICY "Membros da equipe podem adicionar novo pessoal"
ON public.personnel FOR INSERT
WITH CHECK ( is_team_member(team_id) );

CREATE POLICY "Admins podem atualizar qualquer pessoal"
ON public.personnel FOR UPDATE
USING ( get_user_role_in_team(team_id) = 'admin' );

CREATE POLICY "Admins podem deletar qualquer pessoal"
ON public.personnel FOR DELETE
USING ( get_user_role_in_team(team_id) = 'admin' );

-- Tabela: functions
CREATE POLICY "Membros da equipe podem visualizar funções"
ON public.functions FOR SELECT
USING ( is_team_member(team_id) );

CREATE POLICY "Admins da equipe podem inserir funções"
ON public.functions FOR INSERT
WITH CHECK ( get_user_role_in_team(team_id) = 'admin' );

CREATE POLICY "Admins da equipe podem atualizar funções"
ON public.functions FOR UPDATE
USING ( get_user_role_in_team(team_id) = 'admin' );

CREATE POLICY "Admins da equipe podem deletar funções"
ON public.functions FOR DELETE
USING ( get_user_role_in_team(team_id) = 'admin' );