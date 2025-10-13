-- Permitir que 'financeiro' também insira fechamentos de folha
SET search_path TO public;

DROP POLICY IF EXISTS "Admins da equipe podem inserir fechamentos" ON public.payroll_closings;
CREATE POLICY "Admins e financeiro podem inserir fechamentos"
ON public.payroll_closings FOR INSERT
WITH CHECK (
  get_user_role_in_team(team_id) IN ('admin', 'financeiro')
  AND paid_by_id = auth.uid()
);