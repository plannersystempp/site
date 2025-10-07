-- Security Fix 6: Fix remaining functions with search_path
CREATE OR REPLACE FUNCTION public.get_public_teams()
RETURNS TABLE(id uuid, name text, cnpj text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT id, name, cnpj
  FROM public.teams
  ORDER BY name;
$$;

CREATE OR REPLACE FUNCTION public.is_team_member(check_team_id uuid, check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.team_members 
    WHERE team_id = check_team_id 
    AND user_id = check_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.get_all_users_for_superadmin()
RETURNS TABLE(user_id uuid, email text, name text, role text, is_approved boolean, team_name text, team_id uuid, last_sign_in_at timestamp with time zone, created_at timestamp with time zone)
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

CREATE OR REPLACE FUNCTION public.get_audit_logs_for_superadmin(search_text text DEFAULT NULL::text, team_filter uuid DEFAULT NULL::uuid, action_filter text DEFAULT NULL::text, start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, end_date timestamp with time zone DEFAULT NULL::timestamp with time zone)
RETURNS TABLE(id uuid, user_name text, user_email text, team_name text, action text, table_name text, record_id text, old_values jsonb, new_values jsonb, created_at timestamp with time zone)
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

CREATE OR REPLACE FUNCTION public.check_work_days_overlap()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- Verificar se existe alguma alocação da mesma pessoa no mesmo evento
  -- com pelo menos um dia de trabalho em comum
  IF EXISTS (
    SELECT 1 
    FROM public.personnel_allocations 
    WHERE personnel_id = NEW.personnel_id 
    AND event_id = NEW.event_id 
    AND id != COALESCE(NEW.id, gen_random_uuid())  -- Usa um UUID aleatório se NEW.id for NULL
    AND work_days && NEW.work_days  -- Operador de sobreposição de arrays
  ) THEN
    RAISE EXCEPTION 'Esta pessoa já está alocada neste evento para alguns dos dias selecionados.';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_password(password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- Check minimum length
  IF length(password) < 8 THEN
    RETURN false;
  END IF;
  
  -- Check for at least one uppercase letter
  IF password !~ '[A-Z]' THEN
    RETURN false;
  END IF;
  
  -- Check for at least one lowercase letter
  IF password !~ '[a-z]' THEN
    RETURN false;
  END IF;
  
  -- Check for at least one number
  IF password !~ '[0-9]' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_all_functions_with_teams()
RETURNS TABLE(id uuid, name text, description text, team_id uuid, team_name text, created_at timestamp with time zone)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
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

CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  current_user_role text;
BEGIN
  -- Get current user's role
  SELECT role INTO current_user_role 
  FROM public.user_profiles 
  WHERE user_id = auth.uid() AND is_approved = true;
  
  -- Role hierarchy validation
  IF current_user_role = 'admin' THEN
    -- Admins cannot create or modify superadmin roles
    IF NEW.role = 'superadmin' THEN
      RAISE EXCEPTION 'Admins cannot create or modify superadmin roles';
    END IF;
    
    -- Admins cannot modify other admin roles (including their own to prevent self-elevation)
    IF OLD.role = 'admin' AND NEW.role != OLD.role THEN
      RAISE EXCEPTION 'Admins cannot modify admin roles';
    END IF;
  ELSIF current_user_role != 'superadmin' THEN
    -- Only admins and superadmins can change roles
    RAISE EXCEPTION 'Only administrators can modify user roles';
  END IF;
  
  -- Log the role change
  INSERT INTO public.audit_logs (
    user_id, 
    action, 
    table_name, 
    record_id, 
    old_values, 
    new_values
  ) VALUES (
    auth.uid(),
    'ROLE_UPDATE',
    'user_profiles',
    NEW.id::text,
    jsonb_build_object('role', OLD.role, 'is_approved', OLD.is_approved),
    jsonb_build_object('role', NEW.role, 'is_approved', NEW.is_approved)
  );
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user_setup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  team_id_var UUID;
BEGIN
  -- Verifica se o usuário está criando uma nova empresa (com base nos metadados enviados do frontend)
  IF (NEW.raw_user_meta_data->>'isCreatingCompany')::boolean = true THEN
    
    -- Insere a nova equipe na tabela 'teams'
    INSERT INTO public.teams (name, cnpj, owner_id, invite_code)
    VALUES (
      NEW.raw_user_meta_data->>'companyName',
      NEW.raw_user_meta_data->>'companyCnpj',
      NEW.id,
      substring(md5(random()::text) from 1 for 8) -- Gera código de convite
    ) RETURNING id INTO team_id_var;
    
    -- Insere o novo usuário como 'admin' e 'approved' na tabela de membros da equipe
    INSERT INTO public.team_members (team_id, user_id, role, status)
    VALUES (
      team_id_var,
      NEW.id,
      'admin',
      'approved'
    );

    -- Atualiza o perfil do usuário para admin aprovado
    INSERT INTO public.user_profiles (user_id, email, name, role, is_approved)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'name',
      'admin', -- Admin da empresa
      true     -- Admin é automaticamente aprovado
    )
    ON CONFLICT (user_id) DO UPDATE SET
      role = 'admin',
      is_approved = true;

  ELSE
    -- Para usuários regulares ou coordenadores
    INSERT INTO public.user_profiles (user_id, email, name, role, is_approved)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'name',
      'user', -- Papel padrão inicial
      false   -- Usuários regulares começam não aprovados
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;