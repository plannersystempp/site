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

CREATE POLICY "Admins podem gerenciar membros de sua equipe"
ON public.team_members FOR INSERT, UPDATE, DELETE
USING ( get_user_role_in_team(team_id) = 'admin' );

-- Tabela: events
CREATE POLICY "Membros da equipe podem visualizar eventos"
ON public.events FOR SELECT
USING ( is_team_member(team_id) );

CREATE POLICY "Admins da equipe podem gerenciar eventos"
ON public.events FOR INSERT, UPDATE, DELETE
USING ( get_user_role_in_team(team_id) = 'admin' );

-- Tabela: personnel
CREATE POLICY "Membros da equipe podem visualizar o pessoal"
ON public.personnel FOR SELECT
USING ( is_team_member(team_id) );

CREATE POLICY "Membros da equipe podem adicionar novo pessoal"
ON public.personnel FOR INSERT
WITH CHECK ( is_team_member(team_id) );

CREATE POLICY "Admins podem modificar/excluir qualquer pessoal"
ON public.personnel FOR UPDATE, DELETE
USING ( get_user_role_in_team(team_id) = 'admin' );

-- Tabela: functions
CREATE POLICY "Membros da equipe podem visualizar funções"
ON public.functions FOR SELECT
USING ( is_team_member(team_id) );

CREATE POLICY "Admins da equipe podem gerenciar funções"
ON public.functions FOR INSERT, UPDATE, DELETE
USING ( get_user_role_in_team(team_id) = 'admin' );

-- Tabela: event_divisions
CREATE POLICY "Membros da equipe podem visualizar as divisões do evento"
ON public.event_divisions FOR SELECT
USING ( is_team_member(team_id) );

CREATE POLICY "Membros da equipe podem gerenciar as divisões do evento"
ON public.event_divisions FOR INSERT, UPDATE, DELETE
USING ( is_team_member(team_id) );

-- Tabela: personnel_allocations
CREATE POLICY "Membros da equipe podem visualizar alocações"
ON public.personnel_allocations FOR SELECT
USING ( is_team_member(team_id) );

CREATE POLICY "Membros da equipe podem gerenciar alocações"
ON public.personnel_allocations FOR INSERT, UPDATE, DELETE
USING ( is_team_member(team_id) );

-- Tabela: work_records
CREATE POLICY "Membros da equipe podem visualizar registros de trabalho"
ON public.work_records FOR SELECT
USING ( is_team_member(team_id) );

CREATE POLICY "Membros da equipe podem gerenciar registros de trabalho"
ON public.work_records FOR INSERT, UPDATE, DELETE
USING ( is_team_member(team_id) );

-- Tabela: payroll_closings
CREATE POLICY "Membros da equipe podem visualizar fechamentos de folha de pagamento"
ON public.payroll_closings FOR SELECT
USING ( is_team_member(team_id) );

CREATE POLICY "Admins da equipe podem gerenciar fechamentos"
ON public.payroll_closings FOR INSERT, UPDATE, DELETE
USING ( get_user_role_in_team(team_id) = 'admin' );

-- Tabela: freelancer_ratings
CREATE POLICY "Membros da equipe podem visualizar e criar avaliações"
ON public.freelancer_ratings FOR ALL
USING ( is_team_member(team_id) );

-- Tabela: audit_logs
CREATE POLICY "Admins podem visualizar logs de auditoria de suas equipes"
ON public.audit_logs FOR SELECT
USING ( 
  team_id IS NULL OR 
  (team_id IS NOT NULL AND get_user_role_in_team(team_id) = 'admin')
);

CREATE POLICY "Usuários podem inserir seus próprios logs de auditoria"
ON public.audit_logs FOR INSERT
WITH CHECK ( auth.uid() = user_id );