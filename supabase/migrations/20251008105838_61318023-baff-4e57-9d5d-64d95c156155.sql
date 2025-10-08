-- =============================================
-- FASE 3: RPC Functions para SuperAdmin
-- Funções para gerenciamento completo de usuários
-- =============================================

-- Função: Aprovar/Desaprovar usuário
CREATE OR REPLACE FUNCTION public.superadmin_approve_user(
  p_user_id UUID,
  p_approve_status BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  -- Verifica se o usuário atual é superadmin
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Apenas superadmins podem aprovar usuários';
  END IF;

  -- Atualiza o status de aprovação
  UPDATE public.user_profiles
  SET 
    is_approved = p_approve_status,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  IF v_updated_count = 0 THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;
  
  -- Log da ação
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    new_values
  ) VALUES (
    auth.uid(),
    'USER_APPROVAL_CHANGE',
    'user_profiles',
    p_user_id::TEXT,
    jsonb_build_object('is_approved', p_approve_status)
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', CASE 
      WHEN p_approve_status THEN 'Usuário aprovado com sucesso'
      ELSE 'Usuário desaprovado com sucesso'
    END
  );
END;
$$;

-- Função: Mudar role do usuário
CREATE OR REPLACE FUNCTION public.superadmin_change_user_role(
  p_user_id UUID,
  p_new_role TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_old_role TEXT;
  v_updated_count INTEGER;
BEGIN
  -- Verifica se o usuário atual é superadmin
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Apenas superadmins podem mudar roles';
  END IF;
  
  -- Valida o novo role
  IF p_new_role NOT IN ('user', 'coordinator', 'admin', 'superadmin') THEN
    RAISE EXCEPTION 'Role inválido: %', p_new_role;
  END IF;
  
  -- Obtém o role atual
  SELECT role INTO v_old_role
  FROM public.user_profiles
  WHERE user_id = p_user_id;
  
  IF v_old_role IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;
  
  -- Atualiza o role
  UPDATE public.user_profiles
  SET 
    role = p_new_role,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  -- Log da ação
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    'USER_ROLE_CHANGE',
    'user_profiles',
    p_user_id::TEXT,
    jsonb_build_object('role', v_old_role),
    jsonb_build_object('role', p_new_role)
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Role alterado com sucesso',
    'old_role', v_old_role,
    'new_role', p_new_role
  );
END;
$$;

-- Função: Associar usuário a uma equipe
CREATE OR REPLACE FUNCTION public.superadmin_assign_user_to_team(
  p_user_id UUID,
  p_team_id UUID,
  p_role TEXT DEFAULT 'coordinator'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_team_name TEXT;
  v_user_name TEXT;
BEGIN
  -- Verifica se o usuário atual é superadmin
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Apenas superadmins podem associar usuários a equipes';
  END IF;
  
  -- Valida o role
  IF p_role NOT IN ('coordinator', 'admin') THEN
    RAISE EXCEPTION 'Role de equipe inválido: %', p_role;
  END IF;
  
  -- Verifica se a equipe existe
  SELECT name INTO v_team_name
  FROM public.teams
  WHERE id = p_team_id;
  
  IF v_team_name IS NULL THEN
    RAISE EXCEPTION 'Equipe não encontrada';
  END IF;
  
  -- Verifica se o usuário existe
  SELECT name INTO v_user_name
  FROM public.user_profiles
  WHERE user_id = p_user_id;
  
  IF v_user_name IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;
  
  -- Insere ou atualiza o membro da equipe
  INSERT INTO public.team_members (
    team_id,
    user_id,
    role,
    status
  ) VALUES (
    p_team_id,
    p_user_id,
    p_role,
    'approved'
  )
  ON CONFLICT (team_id, user_id) 
  DO UPDATE SET
    role = p_role,
    status = 'approved';
  
  -- Log da ação
  INSERT INTO public.audit_logs (
    user_id,
    team_id,
    action,
    table_name,
    record_id,
    new_values
  ) VALUES (
    auth.uid(),
    p_team_id,
    'USER_TEAM_ASSIGNMENT',
    'team_members',
    p_user_id::TEXT,
    jsonb_build_object(
      'team_id', p_team_id,
      'team_name', v_team_name,
      'user_name', v_user_name,
      'role', p_role
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', format('Usuário %s associado à equipe %s com sucesso', v_user_name, v_team_name),
    'team_name', v_team_name
  );
END;
$$;

-- Função: Remover usuário de uma equipe
CREATE OR REPLACE FUNCTION public.superadmin_remove_user_from_team(
  p_user_id UUID,
  p_team_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_team_name TEXT;
  v_user_name TEXT;
  v_deleted_count INTEGER;
BEGIN
  -- Verifica se o usuário atual é superadmin
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Apenas superadmins podem remover usuários de equipes';
  END IF;
  
  -- Obtém informações para o log
  SELECT t.name, up.name
  INTO v_team_name, v_user_name
  FROM public.teams t
  CROSS JOIN public.user_profiles up
  WHERE t.id = p_team_id
    AND up.user_id = p_user_id;
  
  -- Deleta o membro da equipe
  DELETE FROM public.team_members
  WHERE team_id = p_team_id
    AND user_id = p_user_id;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  IF v_deleted_count = 0 THEN
    RAISE EXCEPTION 'Usuário não encontrado nesta equipe';
  END IF;
  
  -- Log da ação
  INSERT INTO public.audit_logs (
    user_id,
    team_id,
    action,
    table_name,
    record_id,
    old_values
  ) VALUES (
    auth.uid(),
    p_team_id,
    'USER_TEAM_REMOVAL',
    'team_members',
    p_user_id::TEXT,
    jsonb_build_object(
      'team_name', v_team_name,
      'user_name', v_user_name
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', format('Usuário %s removido da equipe %s com sucesso', v_user_name, v_team_name)
  );
END;
$$;