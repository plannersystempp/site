-- Drop e recriar a função get_personnel_redacted com photo_url e shirt_size
DROP FUNCTION IF EXISTS public.get_personnel_redacted();

CREATE FUNCTION public.get_personnel_redacted()
RETURNS TABLE(
  id uuid,
  team_id uuid, 
  name text,
  type text,
  created_at timestamp with time zone,
  photo_url text,
  shirt_size text,
  email_masked text,
  phone_masked text,
  cpf_masked text,
  cnpj_masked text,
  salary_range text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    p.id,
    p.team_id,
    p.name,
    p.type,
    p.created_at,
    p.photo_url,
    p.shirt_size,
    CASE
      WHEN (p.email IS NOT NULL AND p.email <> '') THEN (left(p.email, 1) || '***@' || split_part(p.email, '@', 2))
      ELSE NULL
    END AS email_masked,
    CASE
      WHEN (p.phone IS NOT NULL AND p.phone <> '') THEN (left(p.phone, 2) || '***' || right(p.phone, 2))
      ELSE NULL
    END AS phone_masked,
    CASE
      WHEN (p.cpf IS NOT NULL AND p.cpf <> '') THEN '***.***.***-**'
      ELSE NULL
    END AS cpf_masked,
    CASE
      WHEN (p.cnpj IS NOT NULL AND p.cnpj <> '') THEN '**.***.***/****-**'
      ELSE NULL
    END AS cnpj_masked,
    CASE
      WHEN p.monthly_salary = 0 THEN 'Não informado'
      WHEN p.monthly_salary <= 2000 THEN 'Até R$ 2.000'
      WHEN p.monthly_salary <= 5000 THEN 'R$ 2.001 - R$ 5.000'
      WHEN p.monthly_salary <= 10000 THEN 'R$ 5.001 - R$ 10.000'
      ELSE 'Acima de R$ 10.000'
    END AS salary_range
  FROM public.personnel p
  WHERE (
    is_team_member(p.team_id) OR is_super_admin()
  );
$$;