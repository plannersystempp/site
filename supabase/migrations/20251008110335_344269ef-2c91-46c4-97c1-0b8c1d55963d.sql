-- =============================================
-- FASE 4: Validações e Monitoramento
-- Sistema preventivo para evitar usuários órfãos
-- =============================================

-- Tabela para rastrear falhas no setup de usuários
CREATE TABLE IF NOT EXISTS public.pending_user_setups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  metadata JSONB,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_retry_at TIMESTAMP WITH TIME ZONE,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pending_setups_resolved 
  ON public.pending_user_setups(resolved) 
  WHERE resolved = false;

CREATE INDEX IF NOT EXISTS idx_pending_setups_created 
  ON public.pending_user_setups(created_at);

-- RLS para pending_user_setups
ALTER TABLE public.pending_user_setups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmin can view pending setups"
  ON public.pending_user_setups
  FOR SELECT
  TO authenticated
  USING (is_super_admin());

CREATE POLICY "Superadmin can update pending setups"
  ON public.pending_user_setups
  FOR UPDATE
  TO authenticated
  USING (is_super_admin());

-- Melhorar o trigger handle_new_user_setup com tratamento de erros
CREATE OR REPLACE FUNCTION public.handle_new_user_setup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  team_id_var UUID;
  error_detail TEXT;
BEGIN
  BEGIN
    -- Verifica se o usuário está criando uma nova empresa
    IF (NEW.raw_user_meta_data->>'isCreatingCompany')::boolean = true THEN
      
      -- Insere a nova equipe na tabela 'teams'
      INSERT INTO public.teams (name, cnpj, owner_id, invite_code)
      VALUES (
        NEW.raw_user_meta_data->>'companyName',
        NEW.raw_user_meta_data->>'companyCnpj',
        NEW.id,
        substring(md5(random()::text) from 1 for 8)
      ) RETURNING id INTO team_id_var;
      
      -- Log de sucesso
      RAISE NOTICE 'Team created successfully for user %: team_id=%', NEW.email, team_id_var;
      
      -- Insere o novo usuário como 'admin' e 'approved' na tabela de membros da equipe
      INSERT INTO public.team_members (team_id, user_id, role, status)
      VALUES (team_id_var, NEW.id, 'admin', 'approved');
      
      -- Log de sucesso
      RAISE NOTICE 'Team member created successfully for user %', NEW.email;

      -- Atualiza o perfil do usuário para admin aprovado
      INSERT INTO public.user_profiles (user_id, email, name, role, is_approved)
      VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name', 'admin', true)
      ON CONFLICT (user_id) DO UPDATE SET
        role = 'admin',
        is_approved = true;
      
      -- Log de sucesso
      RAISE NOTICE 'User profile created/updated successfully for user %', NEW.email;

    ELSE
      -- Para usuários regulares ou coordenadores
      INSERT INTO public.user_profiles (user_id, email, name, role, is_approved)
      VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name', 'user', false)
      ON CONFLICT (user_id) DO NOTHING;
      
      -- Log de sucesso
      RAISE NOTICE 'Regular user profile created for user %', NEW.email;
    END IF;

  EXCEPTION
    WHEN OTHERS THEN
      -- Captura o erro
      GET STACKED DIAGNOSTICS error_detail = MESSAGE_TEXT;
      
      -- Log detalhado do erro
      RAISE WARNING 'Failed to setup user %: %', NEW.email, error_detail;
      
      -- Registra o erro na tabela de pending_setups
      INSERT INTO public.pending_user_setups (
        user_id,
        email,
        metadata,
        error_message
      ) VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data,
        error_detail
      )
      ON CONFLICT (user_id) DO UPDATE SET
        error_message = error_detail,
        retry_count = pending_user_setups.retry_count + 1,
        last_retry_at = now();
      
      -- NÃO propaga o erro para não bloquear a criação do usuário no auth
      -- Mas notifica no log
      RAISE NOTICE 'User % setup failed and registered in pending_setups', NEW.email;
  END;

  RETURN NEW;
END;
$$;

-- Função para tentar resolver pending setups
CREATE OR REPLACE FUNCTION public.retry_pending_user_setup(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_pending RECORD;
  v_team_id UUID;
  v_error TEXT;
BEGIN
  -- Verifica se o usuário atual é superadmin
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Apenas superadmins podem resolver pending setups';
  END IF;
  
  -- Obtém o pending setup
  SELECT * INTO v_pending
  FROM public.pending_user_setups
  WHERE user_id = p_user_id
    AND resolved = false;
  
  IF v_pending IS NULL THEN
    RAISE EXCEPTION 'Pending setup não encontrado ou já resolvido';
  END IF;
  
  BEGIN
    -- Tenta criar a empresa se necessário
    IF (v_pending.metadata->>'isCreatingCompany')::boolean = true THEN
      INSERT INTO public.teams (name, cnpj, owner_id, invite_code)
      VALUES (
        v_pending.metadata->>'companyName',
        v_pending.metadata->>'companyCnpj',
        p_user_id,
        substring(md5(random()::text) from 1 for 8)
      ) RETURNING id INTO v_team_id;
      
      INSERT INTO public.team_members (team_id, user_id, role, status)
      VALUES (v_team_id, p_user_id, 'admin', 'approved');
      
      INSERT INTO public.user_profiles (user_id, email, name, role, is_approved)
      VALUES (
        p_user_id,
        v_pending.email,
        v_pending.metadata->>'name',
        'admin',
        true
      )
      ON CONFLICT (user_id) DO UPDATE SET
        role = 'admin',
        is_approved = true;
    ELSE
      INSERT INTO public.user_profiles (user_id, email, name, role, is_approved)
      VALUES (
        p_user_id,
        v_pending.email,
        v_pending.metadata->>'name',
        'user',
        false
      )
      ON CONFLICT (user_id) DO NOTHING;
    END IF;
    
    -- Marca como resolvido
    UPDATE public.pending_user_setups
    SET 
      resolved = true,
      resolved_at = now()
    WHERE user_id = p_user_id;
    
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Setup concluído com sucesso'
    );
    
  EXCEPTION
    WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS v_error = MESSAGE_TEXT;
      
      -- Atualiza o contador de tentativas
      UPDATE public.pending_user_setups
      SET 
        retry_count = retry_count + 1,
        last_retry_at = now(),
        error_message = v_error
      WHERE user_id = p_user_id;
      
      RETURN jsonb_build_object(
        'success', false,
        'message', v_error
      );
  END;
END;
$$;

-- Função para monitorar e reportar usuários órfãos
CREATE OR REPLACE FUNCTION public.check_and_report_orphan_users()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_orphan_count INTEGER;
  v_pending_count INTEGER;
  v_orphans JSONB;
BEGIN
  -- Conta usuários órfãos
  SELECT COUNT(*) INTO v_orphan_count
  FROM auth.users au
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles up WHERE up.user_id = au.id
  )
  OR NOT EXISTS (
    SELECT 1 FROM public.team_members tm WHERE tm.user_id = au.id AND tm.status = 'approved'
  );
  
  -- Conta pending setups não resolvidos
  SELECT COUNT(*) INTO v_pending_count
  FROM public.pending_user_setups
  WHERE resolved = false;
  
  -- Obtém detalhes dos órfãos
  SELECT jsonb_agg(
    jsonb_build_object(
      'user_id', au.id,
      'email', au.email,
      'created_at', au.created_at,
      'has_profile', EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = au.id),
      'has_team', EXISTS (SELECT 1 FROM public.team_members WHERE user_id = au.id)
    )
  ) INTO v_orphans
  FROM auth.users au
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles up WHERE up.user_id = au.id
  )
  OR NOT EXISTS (
    SELECT 1 FROM public.team_members tm WHERE tm.user_id = au.id AND tm.status = 'approved'
  )
  LIMIT 50;
  
  -- Se há órfãos, cria notificação para superadmins
  IF v_orphan_count > 0 THEN
    -- Insere notificação para cada superadmin
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      link
    )
    SELECT 
      up.user_id,
      'system_alert',
      format('⚠️ %s usuário(s) órfão(s) detectado(s)', v_orphan_count),
      format('O sistema detectou %s usuário(s) sem perfil ou equipe completos. Verifique a aba "Usuários Órfãos" no painel SuperAdmin.', v_orphan_count),
      '/app/superadmin'
    FROM public.user_profiles up
    WHERE up.role = 'superadmin'
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN jsonb_build_object(
    'orphan_count', v_orphan_count,
    'pending_setups', v_pending_count,
    'details', v_orphans,
    'timestamp', now()
  );
END;
$$;

-- Função para auto-corrigir casos simples de órfãos
CREATE OR REPLACE FUNCTION public.auto_fix_simple_orphans()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_fixed_count INTEGER := 0;
  v_orphan RECORD;
BEGIN
  -- Procura usuários sem perfil mas com metadados válidos
  FOR v_orphan IN
    SELECT au.id, au.email, au.raw_user_meta_data
    FROM auth.users au
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_profiles up WHERE up.user_id = au.id
    )
    AND au.raw_user_meta_data ? 'name'
  LOOP
    BEGIN
      -- Cria perfil básico
      INSERT INTO public.user_profiles (user_id, email, name, role, is_approved)
      VALUES (
        v_orphan.id,
        v_orphan.email,
        v_orphan.raw_user_meta_data->>'name',
        'user',
        false
      )
      ON CONFLICT (user_id) DO NOTHING;
      
      v_fixed_count := v_fixed_count + 1;
      
      RAISE NOTICE 'Auto-fixed orphan user: %', v_orphan.email;
      
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Failed to auto-fix orphan user %: %', v_orphan.email, SQLERRM;
    END;
  END LOOP;
  
  RETURN jsonb_build_object(
    'fixed_count', v_fixed_count,
    'timestamp', now()
  );
END;
$$;