-- ORDEM 1: ADICIONAR A ROLE 'superadmin' À TABELA DE PERFIS
-- Primeiro, removemos a constraint antiga para poder adicionar o novo valor.
ALTER TABLE public.user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_role_check;

-- Adiciona a nova constraint com o 'superadmin' incluído.
ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_role_check
CHECK (role IN ('admin', 'coordinator', 'user', 'superadmin'));

-- ORDEM 2: PROMOVER O USUÁRIO FELIPE ABREU PARA SUPERADMIN
UPDATE public.user_profiles
SET role = 'superadmin'
WHERE email = 'felipe14abreu@gmail.com';

-- ORDEM 3: CRIAR FUNÇÃO PARA BUSCAR DADOS DE USUÁRIOS PARA SUPERADMIN
CREATE OR REPLACE FUNCTION public.get_all_users_for_superadmin()
RETURNS TABLE(
  user_id uuid,
  email text,
  name text,
  role text,
  is_approved boolean,
  team_name text,
  team_id uuid,
  last_sign_in_at timestamptz,
  created_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT 
    up.user_id,
    up.email,
    up.name,
    up.role,
    up.is_approved,
    t.name as team_name,
    t.id as team_id,
    au.last_sign_in_at,
    up.created_at
  FROM public.user_profiles up
  LEFT JOIN public.team_members tm ON up.user_id = tm.user_id AND tm.status = 'approved'
  LEFT JOIN public.teams t ON tm.team_id = t.id
  LEFT JOIN auth.users au ON up.user_id = au.id
  WHERE EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'superadmin'
  )
  ORDER BY up.created_at DESC;
$$;

-- ORDEM 4: CRIAR FUNÇÃO PARA BUSCAR LOGS DE AUDITORIA PARA SUPERADMIN
CREATE OR REPLACE FUNCTION public.get_audit_logs_for_superadmin(
  search_text text DEFAULT NULL,
  team_filter uuid DEFAULT NULL,
  action_filter text DEFAULT NULL,
  start_date timestamptz DEFAULT NULL,
  end_date timestamptz DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  user_name text,
  user_email text,
  team_name text,
  action text,
  table_name text,
  record_id text,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT 
    al.id,
    up.name as user_name,
    up.email as user_email,
    t.name as team_name,
    al.action,
    al.table_name,
    al.record_id,
    al.old_values,
    al.new_values,
    al.created_at
  FROM public.audit_logs al
  LEFT JOIN public.user_profiles up ON al.user_id = up.user_id
  LEFT JOIN public.teams t ON al.team_id = t.id
  WHERE EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'superadmin'
  )
  AND (search_text IS NULL OR 
       up.name ILIKE '%' || search_text || '%' OR 
       up.email ILIKE '%' || search_text || '%')
  AND (team_filter IS NULL OR al.team_id = team_filter)
  AND (action_filter IS NULL OR al.action = action_filter)
  AND (start_date IS NULL OR al.created_at >= start_date)
  AND (end_date IS NULL OR al.created_at <= end_date)
  ORDER BY al.created_at DESC
  LIMIT 1000;
$$;