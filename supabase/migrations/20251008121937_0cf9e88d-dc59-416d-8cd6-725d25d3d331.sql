-- =====================================================
-- PARTE 1: Trigger de Sincronização Automática
-- =====================================================

-- Função trigger que sincroniza is_approved → team_members.status
CREATE OR REPLACE FUNCTION public.sync_user_approval_to_teams()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- Quando is_approved mudar
  IF OLD.is_approved IS DISTINCT FROM NEW.is_approved THEN
    -- Se foi APROVADO globalmente → aprovar em todas as equipes onde está pendente
    IF NEW.is_approved = TRUE THEN
      UPDATE public.team_members
      SET 
        status = 'approved',
        joined_at = COALESCE(joined_at, now())
      WHERE user_id = NEW.user_id
        AND status = 'pending';
        
      -- Log da sincronização
      INSERT INTO public.audit_logs (
        user_id,
        action,
        table_name,
        record_id,
        new_values
      ) VALUES (
        auth.uid(),
        'SYNC_APPROVAL_TO_TEAMS',
        'team_members',
        NEW.user_id::TEXT,
        jsonb_build_object(
          'is_approved', NEW.is_approved,
          'synced_teams', (SELECT COUNT(*) FROM team_members WHERE user_id = NEW.user_id AND status = 'approved')
        )
      );
    
    -- Se foi DESAPROVADO globalmente → desaprovar em TODAS as equipes
    ELSE
      UPDATE public.team_members
      SET status = 'rejected'
      WHERE user_id = NEW.user_id
        AND status IN ('approved', 'pending');
        
      -- Log da sincronização
      INSERT INTO public.audit_logs (
        user_id,
        action,
        table_name,
        record_id,
        new_values
      ) VALUES (
        auth.uid(),
        'SYNC_DISAPPROVAL_TO_TEAMS',
        'team_members',
        NEW.user_id::TEXT,
        jsonb_build_object(
          'is_approved', NEW.is_approved,
          'rejected_teams', (SELECT COUNT(*) FROM team_members WHERE user_id = NEW.user_id AND status = 'rejected')
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar o trigger
DROP TRIGGER IF EXISTS trigger_sync_user_approval ON public.user_profiles;

CREATE TRIGGER trigger_sync_user_approval
AFTER UPDATE OF is_approved ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_approval_to_teams();

-- =====================================================
-- PARTE 2: Atualizar RPC superadmin_approve_user
-- =====================================================

CREATE OR REPLACE FUNCTION public.superadmin_approve_user(
  p_user_id UUID,
  p_approve_status BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_updated_count INTEGER;
  v_teams_updated INTEGER;
BEGIN
  -- Verifica se o usuário atual é superadmin
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Apenas superadmins podem aprovar usuários';
  END IF;

  -- Atualiza o status de aprovação em user_profiles
  UPDATE public.user_profiles
  SET 
    is_approved = p_approve_status,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  IF v_updated_count = 0 THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;
  
  -- Sincronização EXPLÍCITA de team_members.status
  IF p_approve_status = TRUE THEN
    -- Se aprovando → aprovar todas as equipes pendentes
    UPDATE public.team_members
    SET 
      status = 'approved',
      joined_at = COALESCE(joined_at, now())
    WHERE user_id = p_user_id
      AND status = 'pending';
  ELSE
    -- Se desaprovando → rejeitar TODAS as equipes
    UPDATE public.team_members
    SET status = 'rejected'
    WHERE user_id = p_user_id
      AND status IN ('approved', 'pending');
  END IF;
  
  GET DIAGNOSTICS v_teams_updated = ROW_COUNT;
  
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
    jsonb_build_object(
      'is_approved', p_approve_status,
      'teams_synced', v_teams_updated
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', CASE 
      WHEN p_approve_status THEN 
        format('Usuário aprovado com sucesso. %s equipes sincronizadas.', v_teams_updated)
      ELSE 
        format('Usuário desaprovado com sucesso. %s equipes desaprovadas.', v_teams_updated)
    END,
    'teams_affected', v_teams_updated
  );
END;
$$;

-- =====================================================
-- PARTE 3: RPC para Controle Granular de Status
-- =====================================================

CREATE OR REPLACE FUNCTION public.superadmin_change_team_member_status(
  p_user_id UUID,
  p_team_id UUID,
  p_new_status TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_user_name TEXT;
  v_team_name TEXT;
  v_old_status TEXT;
BEGIN
  -- Verifica se o usuário atual é superadmin
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Apenas superadmins podem alterar status de membros';
  END IF;
  
  -- Valida o novo status
  IF p_new_status NOT IN ('approved', 'pending', 'rejected') THEN
    RAISE EXCEPTION 'Status inválido: %', p_new_status;
  END IF;
  
  -- Obtém informações do usuário e equipe
  SELECT up.name, t.name, tm.status
  INTO v_user_name, v_team_name, v_old_status
  FROM public.user_profiles up
  CROSS JOIN public.teams t
  LEFT JOIN public.team_members tm ON tm.user_id = up.user_id AND tm.team_id = t.id
  WHERE up.user_id = p_user_id
    AND t.id = p_team_id;
  
  IF v_user_name IS NULL OR v_team_name IS NULL THEN
    RAISE EXCEPTION 'Usuário ou equipe não encontrados';
  END IF;
  
  -- Atualiza o status do membro
  UPDATE public.team_members
  SET status = p_new_status
  WHERE user_id = p_user_id
    AND team_id = p_team_id;
  
  -- Log da ação
  INSERT INTO public.audit_logs (
    user_id,
    team_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    p_team_id,
    'SUPERADMIN_TEAM_STATUS_CHANGE',
    'team_members',
    p_user_id::TEXT,
    jsonb_build_object('status', v_old_status),
    jsonb_build_object('status', p_new_status)
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', format('Status de %s na equipe %s alterado para %s', v_user_name, v_team_name, p_new_status)
  );
END;
$$;