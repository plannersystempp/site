-- Criar função pública para listar empresas disponíveis durante o signup
CREATE OR REPLACE FUNCTION public.get_public_teams()
RETURNS TABLE (
  id UUID,
  name TEXT,
  cnpj TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT id, name, cnpj
  FROM public.teams
  ORDER BY name;
$$;