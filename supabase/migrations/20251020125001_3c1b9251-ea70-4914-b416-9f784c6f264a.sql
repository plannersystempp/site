-- Ajustar política RLS de payroll_closings para permitir que coordenadores também visualizem históricos de pagamento
-- Isso permite que coordenadores vejam os históricos de pagamento (read-only)
-- sem dar permissões de criar/editar/deletar

DROP POLICY IF EXISTS "Only admins can view payroll closings" ON payroll_closings;

CREATE POLICY "Admins and coordinators can view payroll closings"
ON payroll_closings
FOR SELECT
USING (
  is_super_admin() OR 
  get_user_role_in_team(team_id) = 'admin' OR 
  get_user_role_in_team(team_id) = 'coordinator'
);