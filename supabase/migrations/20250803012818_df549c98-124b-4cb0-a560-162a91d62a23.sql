
-- ORDEM 1: CRIAR FUNÇÃO RPC PARA BUSCAR FUNÇÕES COM NOMES DAS EQUIPES

CREATE OR REPLACE FUNCTION public.get_all_functions_with_teams()
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  team_id uuid,
  team_name text,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  -- Apenas o superadmin pode chamar esta função
  -- A verificação está dentro da função para segurança.
  IF (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()) != 'superadmin' THEN
    RAISE EXCEPTION 'Permission denied: must be a super admin.';
  END IF;

  RETURN QUERY
  SELECT
    f.id,
    f.name,
    f.description,
    f.team_id,
    t.name as team_name,
    f.created_at
  FROM
    public.functions AS f
  JOIN
    public.teams AS t ON f.team_id = t.id
  ORDER BY
    t.name, f.name;
END;
$$;
