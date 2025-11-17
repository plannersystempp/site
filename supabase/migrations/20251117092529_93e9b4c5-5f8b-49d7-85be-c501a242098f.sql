-- Função para aprovar usuário e atualizar role atomicamente
CREATE OR REPLACE FUNCTION public.approve_team_member_with_role(
  p_team_id UUID,
  p_user_id UUID,
  p_role TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  v_team_name TEXT;
  v_user_name TEXT;
BEGIN
  -- Validar role
  IF p_role NOT IN ('admin', 'coordinator', 'financeiro') THEN
    RAISE EXCEPTION 'Invalid role: %', p_role;
  END IF;

  -- Verificar se usuário solicitante é admin da equipe
  IF NOT EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_id = p_team_id 
    AND user_id = auth.uid() 
    AND role = 'admin' 
    AND status = 'approved'
  ) THEN
    RAISE EXCEPTION 'Only team admins can approve members';
  END IF;

  -- Atualizar team_members
  UPDATE team_members
  SET status = 'approved', role = p_role
  WHERE team_id = p_team_id AND user_id = p_user_id;

  -- Atualizar user_profiles
  UPDATE user_profiles
  SET is_approved = true, role = p_role
  WHERE user_id = p_user_id;

  -- Buscar nomes para log
  SELECT name INTO v_team_name FROM teams WHERE id = p_team_id;
  SELECT name INTO v_user_name FROM user_profiles WHERE user_id = p_user_id;

  -- Log de auditoria
  INSERT INTO audit_logs (user_id, team_id, action, table_name, record_id, new_values)
  VALUES (
    auth.uid(),
    p_team_id,
    'MEMBER_APPROVED',
    'team_members',
    p_user_id::text,
    jsonb_build_object(
      'approved_role', p_role,
      'team_name', v_team_name,
      'user_name', v_user_name
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'User approved successfully',
    'user_id', p_user_id,
    'role', p_role
  );
END;
$$;