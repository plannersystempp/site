
-- Função para obter o papel do usuário em uma equipe
CREATE OR REPLACE FUNCTION public.get_user_role_in_team(team_id UUID, user_id UUID)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role 
  FROM public.team_members 
  WHERE team_members.team_id = $1 
  AND team_members.user_id = $2
  LIMIT 1;
$$;

-- Função para verificar se o usuário é membro da equipe
CREATE OR REPLACE FUNCTION public.is_team_member(team_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.team_members 
    WHERE team_members.team_id = $1 
    AND team_members.user_id = $2
  );
$$;
