-- Habilitar Row Level Security na tabela personnel_redacted
ALTER TABLE public.personnel_redacted ENABLE ROW LEVEL SECURITY;

-- Política para permitir que membros da equipe vejam dados mascarados de pessoal de sua equipe
CREATE POLICY "Membros da equipe podem visualizar dados mascarados de pessoal OR super admin"
ON public.personnel_redacted
FOR SELECT
USING (is_team_member(team_id) OR is_super_admin());

-- Política para permitir que administradores da equipe insiram dados mascarados
CREATE POLICY "Admins da equipe podem inserir dados mascarados"
ON public.personnel_redacted
FOR INSERT
WITH CHECK (get_user_role_in_team(team_id) = 'admin');

-- Política para permitir que administradores da equipe atualizem dados mascarados
CREATE POLICY "Admins da equipe podem atualizar dados mascarados"
ON public.personnel_redacted
FOR UPDATE
USING (get_user_role_in_team(team_id) = 'admin')
WITH CHECK (get_user_role_in_team(team_id) = 'admin');

-- Política para permitir que administradores da equipe deletem dados mascarados
CREATE POLICY "Admins da equipe podem deletar dados mascarados"
ON public.personnel_redacted
FOR DELETE
USING (get_user_role_in_team(team_id) = 'admin');