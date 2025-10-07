
-- 1) Índice para acelerar a busca por invite_code (não-único para não falhar se existirem duplicatas)
CREATE INDEX IF NOT EXISTS idx_teams_invite_code ON public.teams (invite_code);

-- 2) Função pública para validar o código de convite sem precisar ser membro
CREATE OR REPLACE FUNCTION public.get_team_by_invite_code(invite_code_input text)
RETURNS TABLE(id uuid, name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT id, name
  FROM public.teams
  WHERE invite_code = UPPER(invite_code_input)
  LIMIT 1;
$$;

-- 3) Função para registrar a solicitação de acesso à equipe (status 'pending')
-- Observações:
-- - Executa com SECURITY DEFINER para contornar RLS com segurança
-- - Recebe o user_id criado no signUp (o signUp retorna user.id mesmo sem sessão)
-- - Evita duplicidade de solicitações
CREATE OR REPLACE FUNCTION public.request_team_access(
  invite_code_input text,
  request_user_id uuid,
  requested_role text DEFAULT 'coordinator'
)
RETURNS TABLE(team_id uuid, team_name text, member_status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_team_id uuid;
  v_team_name text;
  v_existing_status text;
  v_member_id uuid;
BEGIN
  -- Valida o código e obtém a equipe
  SELECT t.id, t.name
    INTO v_team_id, v_team_name
  FROM public.teams t
  WHERE t.invite_code = UPPER(invite_code_input)
  LIMIT 1;

  IF v_team_id IS NULL THEN
    RAISE EXCEPTION 'INVALID_INVITE_CODE';
  END IF;

  -- Verifica se já existe vínculo/solicitação
  SELECT tm.status
    INTO v_existing_status
  FROM public.team_members tm
  WHERE tm.team_id = v_team_id
    AND tm.user_id = request_user_id
  LIMIT 1;

  IF v_existing_status IS NULL THEN
    -- Cria solicitação 'pending' com role padrão 'coordinator'
    INSERT INTO public.team_members (team_id, user_id, role, status, joined_with_code)
    VALUES (v_team_id, request_user_id, COALESCE(requested_role, 'coordinator'), 'pending', UPPER(invite_code_input))
    RETURNING user_id INTO v_member_id;

    v_existing_status := 'pending';

    -- Log opcional (RLS é ignorado por SECURITY DEFINER)
    INSERT INTO public.audit_logs (user_id, team_id, action, table_name, record_id, new_values)
    VALUES (
      request_user_id,
      v_team_id,
      'TEAM_ACCESS_REQUEST',
      'team_members',
      NULL,
      jsonb_build_object('status', v_existing_status, 'role', COALESCE(requested_role, 'coordinator'))
    );
  END IF;

  RETURN QUERY SELECT v_team_id, v_team_name, v_existing_status;
END;
$$;
