-- Corrigir políticas RLS para permitir acesso de super admin a todos os dados

-- Primeiro, criar função helper para verificar se é super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'superadmin'
  )
$function$;

-- Atualizar política da tabela teams
DROP POLICY IF EXISTS "Team members can view their teams" ON public.teams;
CREATE POLICY "Team members can view their teams OR super admin can view all"
ON public.teams
FOR SELECT
USING (
  is_team_member(id, auth.uid()) OR is_super_admin()
);

-- Atualizar política da tabela events
DROP POLICY IF EXISTS "Membros da equipe podem visualizar eventos" ON public.events;
CREATE POLICY "Membros da equipe podem visualizar eventos OR super admin"
ON public.events
FOR SELECT
USING (
  is_team_member(team_id) OR is_super_admin()
);

-- Atualizar política da tabela personnel
DROP POLICY IF EXISTS "Membros da equipe podem visualizar o pessoal" ON public.personnel;
CREATE POLICY "Membros da equipe podem visualizar o pessoal OR super admin"
ON public.personnel
FOR SELECT
USING (
  is_team_member(team_id) OR is_super_admin()
);

-- Atualizar política da tabela functions
DROP POLICY IF EXISTS "Membros da equipe podem visualizar funções" ON public.functions;
CREATE POLICY "Membros da equipe podem visualizar funções OR super admin"
ON public.functions
FOR SELECT
USING (
  is_team_member(team_id) OR is_super_admin()
);

-- Atualizar política da tabela team_members
DROP POLICY IF EXISTS "Membros podem ver membros de suas equipes" ON public.team_members;
CREATE POLICY "Membros podem ver membros de suas equipes OR super admin"
ON public.team_members
FOR SELECT
USING (
  is_team_member(team_id) OR is_super_admin()
);

-- Atualizar política da tabela event_divisions
DROP POLICY IF EXISTS "Membros da equipe podem visualizar as divisões do evento" ON public.event_divisions;
CREATE POLICY "Membros da equipe podem visualizar as divisões do evento OR super admin"
ON public.event_divisions
FOR SELECT
USING (
  is_team_member(team_id) OR is_super_admin()
);

-- Atualizar política da tabela personnel_allocations
DROP POLICY IF EXISTS "Membros da equipe podem visualizar alocações" ON public.personnel_allocations;
CREATE POLICY "Membros da equipe podem visualizar alocações OR super admin"
ON public.personnel_allocations
FOR SELECT
USING (
  is_team_member(team_id) OR is_super_admin()
);

-- Atualizar política da tabela work_records
DROP POLICY IF EXISTS "Membros da equipe podem visualizar registros de trabalho" ON public.work_records;
CREATE POLICY "Membros da equipe podem visualizar registros de trabalho OR super admin"
ON public.work_records
FOR SELECT
USING (
  is_team_member(team_id) OR is_super_admin()
);

-- Atualizar política da tabela payroll_closings
DROP POLICY IF EXISTS "Membros da equipe podem visualizar fechamentos de folha de paga" ON public.payroll_closings;
CREATE POLICY "Membros da equipe podem visualizar fechamentos de folha de paga OR super admin"
ON public.payroll_closings
FOR SELECT
USING (
  is_team_member(team_id) OR is_super_admin()
);

-- Atualizar política da tabela freelancer_ratings
DROP POLICY IF EXISTS "Membros da equipe podem visualizar avaliações" ON public.freelancer_ratings;
CREATE POLICY "Membros da equipe podem visualizar avaliações OR super admin"
ON public.freelancer_ratings
FOR SELECT
USING (
  is_team_member(team_id) OR is_super_admin()
);

-- Atualizar política da tabela audit_logs
DROP POLICY IF EXISTS "Admins podem visualizar logs de auditoria de suas equipes" ON public.audit_logs;
CREATE POLICY "Admins podem visualizar logs de auditoria de suas equipes OR super admin pode ver todos"
ON public.audit_logs
FOR SELECT
USING (
  ((team_id IS NULL) OR ((team_id IS NOT NULL) AND (get_user_role_in_team(team_id) = 'admin'::text))) 
  OR is_super_admin()
);