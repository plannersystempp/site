-- Continuando com as demais tabelas

-- Tabela: event_divisions
CREATE POLICY "Membros da equipe podem visualizar as divisões do evento"
ON public.event_divisions FOR SELECT
USING ( is_team_member(team_id) );

CREATE POLICY "Membros da equipe podem inserir divisões do evento"
ON public.event_divisions FOR INSERT
WITH CHECK ( is_team_member(team_id) );

CREATE POLICY "Membros da equipe podem atualizar divisões do evento"
ON public.event_divisions FOR UPDATE
USING ( is_team_member(team_id) );

CREATE POLICY "Membros da equipe podem deletar divisões do evento"
ON public.event_divisions FOR DELETE
USING ( is_team_member(team_id) );

-- Tabela: personnel_allocations
CREATE POLICY "Membros da equipe podem visualizar alocações"
ON public.personnel_allocations FOR SELECT
USING ( is_team_member(team_id) );

CREATE POLICY "Membros da equipe podem inserir alocações"
ON public.personnel_allocations FOR INSERT
WITH CHECK ( is_team_member(team_id) );

CREATE POLICY "Membros da equipe podem atualizar alocações"
ON public.personnel_allocations FOR UPDATE
USING ( is_team_member(team_id) );

CREATE POLICY "Membros da equipe podem deletar alocações"
ON public.personnel_allocations FOR DELETE
USING ( is_team_member(team_id) );

-- Tabela: work_records
CREATE POLICY "Membros da equipe podem visualizar registros de trabalho"
ON public.work_records FOR SELECT
USING ( is_team_member(team_id) );

CREATE POLICY "Membros da equipe podem inserir registros de trabalho"
ON public.work_records FOR INSERT
WITH CHECK ( is_team_member(team_id) );

CREATE POLICY "Membros da equipe podem atualizar registros de trabalho"
ON public.work_records FOR UPDATE
USING ( is_team_member(team_id) );

CREATE POLICY "Membros da equipe podem deletar registros de trabalho"
ON public.work_records FOR DELETE
USING ( is_team_member(team_id) );

-- Tabela: payroll_closings
CREATE POLICY "Membros da equipe podem visualizar fechamentos de folha de pagamento"
ON public.payroll_closings FOR SELECT
USING ( is_team_member(team_id) );

CREATE POLICY "Admins da equipe podem inserir fechamentos"
ON public.payroll_closings FOR INSERT
WITH CHECK ( get_user_role_in_team(team_id) = 'admin' );

CREATE POLICY "Admins da equipe podem atualizar fechamentos"
ON public.payroll_closings FOR UPDATE
USING ( get_user_role_in_team(team_id) = 'admin' );

CREATE POLICY "Admins da equipe podem deletar fechamentos"
ON public.payroll_closings FOR DELETE
USING ( get_user_role_in_team(team_id) = 'admin' );

-- Tabela: freelancer_ratings
CREATE POLICY "Membros da equipe podem visualizar avaliações"
ON public.freelancer_ratings FOR SELECT
USING ( is_team_member(team_id) );

CREATE POLICY "Membros da equipe podem inserir avaliações"
ON public.freelancer_ratings FOR INSERT
WITH CHECK ( is_team_member(team_id) );

CREATE POLICY "Membros da equipe podem atualizar avaliações"
ON public.freelancer_ratings FOR UPDATE
USING ( is_team_member(team_id) );

CREATE POLICY "Membros da equipe podem deletar avaliações"
ON public.freelancer_ratings FOR DELETE
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