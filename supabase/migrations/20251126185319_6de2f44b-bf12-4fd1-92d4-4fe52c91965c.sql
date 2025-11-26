-- Vincular o usuário porfiro@laftech.com.br à equipe FlorLaf
-- Obter o user_id do usuário porfiro@laftech.com.br
DO $$
DECLARE
  v_user_id uuid;
  v_team_id uuid;
BEGIN
  -- Buscar o user_id do usuário
  SELECT user_id INTO v_user_id
  FROM public.user_profiles
  WHERE email = 'porfiro@laftech.com.br';
  
  -- Buscar o team_id da equipe FlorLaf
  SELECT id INTO v_team_id
  FROM public.teams
  WHERE name = 'FlorLaf';
  
  -- Verificar se encontrou ambos
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário porfiro@laftech.com.br não encontrado';
  END IF;
  
  IF v_team_id IS NULL THEN
    RAISE EXCEPTION 'Equipe FlorLaf não encontrada';
  END IF;
  
  -- Inserir o registro em team_members se não existir
  INSERT INTO public.team_members (team_id, user_id, role, status, joined_at)
  VALUES (v_team_id, v_user_id, 'coordinator', 'pending', now())
  ON CONFLICT (team_id, user_id) DO UPDATE
  SET status = 'pending', role = 'coordinator', joined_at = COALESCE(team_members.joined_at, now());
  
  -- Atualizar o user_profiles para role coordinator se ainda for 'user'
  UPDATE public.user_profiles
  SET role = 'coordinator', is_approved = false
  WHERE user_id = v_user_id AND role = 'user';
  
  -- Log da ação
  INSERT INTO public.audit_logs (
    user_id,
    team_id,
    action,
    table_name,
    record_id,
    new_values
  ) VALUES (
    v_user_id,
    v_team_id,
    'MANUAL_TEAM_LINK',
    'team_members',
    v_user_id::TEXT,
    jsonb_build_object(
      'email', 'porfiro@laftech.com.br',
      'team', 'FlorLaf',
      'status', 'pending',
      'reason', 'Manual fix for failed invite code signup'
    )
  );
  
  RAISE NOTICE 'Usuário porfiro@laftech.com.br vinculado à equipe FlorLaf com sucesso';
END $$;

-- Melhorar a função join_team_by_invite_code para ser mais robusta
CREATE OR REPLACE FUNCTION public.join_team_by_invite_code(p_invite_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_team_id UUID;
  v_team_name TEXT;
  v_user_id UUID;
  v_user_email TEXT;
  v_user_name TEXT;
  v_existing_status TEXT;
  v_profile_exists BOOLEAN;
  v_result jsonb;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  -- Get user data from auth.users with error handling
  BEGIN
    SELECT email, COALESCE(raw_user_meta_data->>'name', email) 
    INTO STRICT v_user_email, v_user_name
    FROM auth.users
    WHERE id = v_user_id;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE EXCEPTION 'Dados do usuário não encontrados';
  END;
  
  -- Find team by invite code (case-insensitive)
  SELECT id, name INTO v_team_id, v_team_name
  FROM public.teams
  WHERE UPPER(invite_code) = UPPER(TRIM(p_invite_code));
  
  IF v_team_id IS NULL THEN
    RAISE EXCEPTION 'Código de convite inválido';
  END IF;
  
  -- Check if user profile exists
  SELECT EXISTS(
    SELECT 1 FROM public.user_profiles WHERE user_id = v_user_id
  ) INTO v_profile_exists;
  
  -- Ensure user profile exists with proper error handling
  IF NOT v_profile_exists THEN
    BEGIN
      INSERT INTO public.user_profiles (user_id, email, name, role, is_approved)
      VALUES (v_user_id, v_user_email, v_user_name, 'coordinator', false)
      ON CONFLICT (user_id) DO UPDATE
      SET email = EXCLUDED.email, name = EXCLUDED.name;
      
      RAISE NOTICE 'Perfil de usuário criado para: %', v_user_email;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao criar perfil do usuário: %', SQLERRM;
    END;
  END IF;
  
  -- Check if user is already a member with detailed status
  SELECT status INTO v_existing_status
  FROM public.team_members
  WHERE team_id = v_team_id AND user_id = v_user_id;
  
  IF v_existing_status IS NULL THEN
    -- Add as pending member with error handling
    BEGIN
      INSERT INTO public.team_members (team_id, user_id, role, status, joined_with_code, joined_at)
      VALUES (v_team_id, v_user_id, 'coordinator', 'pending', UPPER(TRIM(p_invite_code)), now())
      ON CONFLICT (team_id, user_id) DO UPDATE
      SET status = 'pending', joined_with_code = UPPER(TRIM(p_invite_code)), joined_at = COALESCE(team_members.joined_at, now());
      
      v_existing_status := 'pending';
      RAISE NOTICE 'Usuário % adicionado à equipe % como pending', v_user_email, v_team_name;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao adicionar usuário à equipe: %', SQLERRM;
    END;
  ELSE
    RAISE NOTICE 'Usuário já tem status % na equipe %', v_existing_status, v_team_name;
  END IF;
  
  -- Update user profile to coordinator (pending approval) with error handling
  BEGIN
    UPDATE public.user_profiles 
    SET role = 'coordinator', is_approved = false, updated_at = now()
    WHERE user_id = v_user_id;
    
    RAISE NOTICE 'Perfil atualizado para coordinator (aguardando aprovação)';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Erro ao atualizar perfil: %', SQLERRM;
  END;
  
  -- Log the action for audit trail
  BEGIN
    INSERT INTO public.audit_logs (
      user_id,
      team_id,
      action,
      table_name,
      record_id,
      new_values
    ) VALUES (
      v_user_id,
      v_team_id,
      'TEAM_JOIN_BY_INVITE',
      'team_members',
      v_user_id::TEXT,
      jsonb_build_object(
        'team_name', v_team_name,
        'invite_code', UPPER(TRIM(p_invite_code)),
        'status', v_existing_status,
        'email', v_user_email
      )
    );
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Erro ao registrar audit log: %', SQLERRM;
  END;
  
  -- Build success response
  v_result := jsonb_build_object(
    'team_id', v_team_id,
    'team_name', v_team_name,
    'status', v_existing_status,
    'success', true,
    'message', CASE 
      WHEN v_existing_status = 'pending' THEN 'Solicitação enviada! Aguardando aprovação do administrador.'
      WHEN v_existing_status = 'approved' THEN 'Você já é membro aprovado desta equipe.'
      WHEN v_existing_status = 'rejected' THEN 'Sua solicitação anterior foi rejeitada. Entre em contato com o administrador.'
      ELSE 'Status desconhecido'
    END
  );
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and return informative message
    RAISE EXCEPTION 'Erro ao processar convite: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END;
$function$;