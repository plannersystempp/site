-- Fix critical security vulnerability in work_records table
-- Currently ANY team member can modify financial data, this should be restricted to admins and coordinators only

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Membros da equipe podem atualizar registros de trabalho" ON public.work_records;
DROP POLICY IF EXISTS "Membros da equipe podem deletar registros de trabalho" ON public.work_records;
DROP POLICY IF EXISTS "Membros da equipe podem inserir registros de trabalho" ON public.work_records;

-- Create secure policies that restrict financial data modification to admins and coordinators only
CREATE POLICY "Apenas admins e coordenadores podem atualizar registros de trabalho"
ON public.work_records
FOR UPDATE
USING (get_user_role_in_team(team_id) = ANY (ARRAY['admin'::text, 'coordinator'::text]));

CREATE POLICY "Apenas admins e coordenadores podem deletar registros de trabalho" 
ON public.work_records
FOR DELETE
USING (get_user_role_in_team(team_id) = ANY (ARRAY['admin'::text, 'coordinator'::text]));

CREATE POLICY "Apenas admins e coordenadores podem inserir registros de trabalho"
ON public.work_records
FOR INSERT
WITH CHECK (get_user_role_in_team(team_id) = ANY (ARRAY['admin'::text, 'coordinator'::text]));

-- Log this security fix in audit trail
INSERT INTO public.audit_logs (
  user_id,
  action,
  table_name,
  record_id,
  new_values
) VALUES (
  auth.uid(),
  'SECURITY_FIX_RLS_POLICIES',
  'work_records',
  'RLS_POLICIES',
  jsonb_build_object(
    'fix_description', 'Restricted work_records UPDATE/DELETE/INSERT to admins and coordinators only',
    'previous_policy', 'is_team_member(team_id) - allowed ANY team member',
    'new_policy', 'get_user_role_in_team(team_id) = ANY (admin, coordinator)',
    'security_level', 'CRITICAL'
  )
);