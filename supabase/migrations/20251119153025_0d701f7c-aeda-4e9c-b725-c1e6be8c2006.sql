-- Permitir que coordenadores e financeiro visualizem dados de event_payroll para previsão de pagamentos
-- Isso é necessário para que a funcionalidade de previsão de pagamentos funcione corretamente

-- Adicionar policy para coordenadores e financeiro poderem ver event_payroll
CREATE POLICY "Membros da equipe podem visualizar folhas para previsão"
ON event_payroll
FOR SELECT
USING (
  is_super_admin() 
  OR get_user_role_in_team(team_id) = 'admin'
  OR get_user_role_in_team(team_id) = 'coordinator'
  OR get_user_role_in_team(team_id) = 'financeiro'
);

-- Remover a policy antiga mais restritiva
DROP POLICY IF EXISTS "Admins podem visualizar folhas de pagamento" ON event_payroll;