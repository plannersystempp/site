-- CORREÇÃO: Remover acesso de coordenadores a TODOS os dados financeiros
-- Coordenadores não devem ver: folha de pagamento, pagamentos avulsos, previsão de pagamentos, custos

-- 1. EVENT_PAYROLL - Apenas admin, financeiro e superadmin
DROP POLICY IF EXISTS "Membros da equipe podem visualizar folhas para previsão" ON event_payroll;

CREATE POLICY "Apenas admin e financeiro podem visualizar folhas"
ON event_payroll
FOR SELECT
USING (
  is_super_admin() 
  OR get_user_role_in_team(team_id) = 'admin'
  OR get_user_role_in_team(team_id) = 'financeiro'
);

-- 2. PERSONNEL_PAYMENTS - Apenas admin, financeiro e superadmin
DROP POLICY IF EXISTS "Team members can view personnel payments" ON personnel_payments;

CREATE POLICY "Apenas admin e financeiro podem visualizar pagamentos avulsos"
ON personnel_payments
FOR SELECT
USING (
  is_super_admin()
  OR get_user_role_in_team(team_id) = 'admin'
  OR get_user_role_in_team(team_id) = 'financeiro'
);

-- 3. EVENT_SUPPLIER_COSTS - Atualizar policy existente
DROP POLICY IF EXISTS "Acesso granular a custos" ON event_supplier_costs;

CREATE POLICY "Apenas admin e financeiro podem visualizar custos"
ON event_supplier_costs
FOR SELECT
USING (
  is_super_admin()
  OR get_user_role_in_team(team_id) = 'admin'
  OR get_user_role_in_team(team_id) = 'financeiro'
);

DROP POLICY IF EXISTS "Coordenadores podem gerenciar custos se autorizados" ON event_supplier_costs;

CREATE POLICY "Apenas admin e financeiro podem gerenciar custos"
ON event_supplier_costs
FOR ALL
USING (
  get_user_role_in_team(team_id) = 'admin'
  OR get_user_role_in_team(team_id) = 'financeiro'
);

-- 4. PAYROLL_CLOSINGS - Garantir que apenas admin e financeiro vejam
DROP POLICY IF EXISTS "Admins and coordinators can view payroll closings" ON payroll_closings;

CREATE POLICY "Apenas admin e financeiro podem visualizar fechamentos"
ON payroll_closings
FOR SELECT
USING (
  is_super_admin()
  OR get_user_role_in_team(team_id) = 'admin'
  OR get_user_role_in_team(team_id) = 'financeiro'
);

-- 5. PAYROLL_PAYMENTS - Garantir que apenas admin e financeiro vejam
DROP POLICY IF EXISTS "Admins podem visualizar pagamentos" ON payroll_payments;

CREATE POLICY "Apenas admin e financeiro podem visualizar pagamentos de folha"
ON payroll_payments
FOR SELECT
USING (
  is_super_admin()
  OR get_user_role_in_team(team_id) = 'admin'
  OR get_user_role_in_team(team_id) = 'financeiro'
);