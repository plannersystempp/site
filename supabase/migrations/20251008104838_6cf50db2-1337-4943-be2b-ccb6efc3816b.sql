-- FASE 1: Corrigir usuários órfãos existentes
-- Esta migration identifica e corrige usuários que existem em auth.users mas não têm user_profiles ou team_members

-- 1. Criar empresa "Empresa texte" para fgoainvest@gmail.com
DO $$
DECLARE
  v_team_id uuid;
  v_user_id uuid := '9380f9b3-52d7-4804-9e12-ba105464acec';
  v_invite_code text;
BEGIN
  -- Gerar código de convite único
  v_invite_code := UPPER(substring(md5(random()::text) from 1 for 8));
  
  -- Criar team "Empresa texte"
  INSERT INTO public.teams (name, cnpj, owner_id, invite_code)
  VALUES (
    'Empresa texte',
    '40.432.544/0001-40',
    v_user_id,
    v_invite_code
  )
  RETURNING id INTO v_team_id;
  
  -- Criar user_profile
  INSERT INTO public.user_profiles (user_id, email, name, role, is_approved)
  VALUES (
    v_user_id,
    'fgoainvest@gmail.com',
    'Carlos Coor',
    'admin',
    true
  )
  ON CONFLICT (user_id) DO UPDATE
  SET 
    role = 'admin',
    is_approved = true;
  
  -- Criar team_member
  INSERT INTO public.team_members (team_id, user_id, role, status)
  VALUES (
    v_team_id,
    v_user_id,
    'admin',
    'approved'
  )
  ON CONFLICT (team_id, user_id) DO UPDATE
  SET 
    status = 'approved',
    role = 'admin';
  
  -- Log da correção
  INSERT INTO public.audit_logs (
    user_id,
    team_id,
    action,
    table_name,
    record_id,
    new_values
  )
  VALUES (
    v_user_id,
    v_team_id,
    'ORPHAN_USER_FIX',
    'user_profiles',
    v_user_id::text,
    jsonb_build_object(
      'action', 'Fixed orphan user - created company',
      'user_email', 'fgoainvest@gmail.com',
      'company_name', 'Empresa texte',
      'company_cnpj', '40.432.544/0001-40',
      'invite_code', v_invite_code,
      'fixed_by', 'migration_phase_1'
    )
  );
  
  RAISE NOTICE 'Usuário órfão fgoainvest@gmail.com corrigido. Team ID: %, Invite Code: %', v_team_id, v_invite_code;
END $$;

-- 2. Buscar e corrigir outros usuários órfãos
-- Cria uma função temporária para processar usuários órfãos
CREATE OR REPLACE FUNCTION fix_orphan_users()
RETURNS TABLE(
  user_id uuid,
  email text,
  action_taken text,
  team_id uuid,
  invite_code text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  orphan_user RECORD;
  v_team_id uuid;
  v_invite_code text;
  v_user_name text;
  v_company_name text;
  v_company_cnpj text;
  v_is_creating_company boolean;
BEGIN
  -- Buscar usuários órfãos (existem em auth.users mas não em user_profiles)
  FOR orphan_user IN 
    SELECT 
      au.id,
      au.email,
      au.raw_user_meta_data
    FROM auth.users au
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_profiles up WHERE up.user_id = au.id
    )
    AND au.id != '9380f9b3-52d7-4804-9e12-ba105464acec' -- Já corrigimos este acima
  LOOP
    -- Extrair dados dos metadados
    v_user_name := COALESCE(
      orphan_user.raw_user_meta_data->>'name',
      split_part(orphan_user.email, '@', 1)
    );
    v_is_creating_company := COALESCE(
      (orphan_user.raw_user_meta_data->>'isCreatingCompany')::boolean,
      false
    );
    v_company_name := orphan_user.raw_user_meta_data->>'companyName';
    v_company_cnpj := orphan_user.raw_user_meta_data->>'companyCnpj';
    
    IF v_is_creating_company AND v_company_name IS NOT NULL THEN
      -- Usuário tentou criar empresa - criar team e torná-lo admin
      v_invite_code := UPPER(substring(md5(random()::text) from 1 for 8));
      
      INSERT INTO public.teams (name, cnpj, owner_id, invite_code)
      VALUES (
        v_company_name,
        v_company_cnpj,
        orphan_user.id,
        v_invite_code
      )
      RETURNING id INTO v_team_id;
      
      INSERT INTO public.user_profiles (user_id, email, name, role, is_approved)
      VALUES (
        orphan_user.id,
        orphan_user.email,
        v_user_name,
        'admin',
        true
      );
      
      INSERT INTO public.team_members (team_id, user_id, role, status)
      VALUES (
        v_team_id,
        orphan_user.id,
        'admin',
        'approved'
      );
      
      -- Log
      INSERT INTO public.audit_logs (
        user_id,
        team_id,
        action,
        table_name,
        record_id,
        new_values
      )
      VALUES (
        orphan_user.id,
        v_team_id,
        'ORPHAN_USER_FIX',
        'user_profiles',
        orphan_user.id::text,
        jsonb_build_object(
          'action', 'Fixed orphan user - created company',
          'user_email', orphan_user.email,
          'company_name', v_company_name,
          'company_cnpj', v_company_cnpj,
          'invite_code', v_invite_code,
          'fixed_by', 'migration_phase_1'
        )
      );
      
      RETURN QUERY SELECT 
        orphan_user.id,
        orphan_user.email,
        'Created company and admin profile'::text,
        v_team_id,
        v_invite_code;
      
    ELSE
      -- Usuário regular sem empresa - criar apenas user_profile (aguardando associação manual)
      INSERT INTO public.user_profiles (user_id, email, name, role, is_approved)
      VALUES (
        orphan_user.id,
        orphan_user.email,
        v_user_name,
        'user',
        false
      );
      
      -- Log
      INSERT INTO public.audit_logs (
        user_id,
        action,
        table_name,
        record_id,
        new_values
      )
      VALUES (
        orphan_user.id,
        'ORPHAN_USER_FIX',
        'user_profiles',
        orphan_user.id::text,
        jsonb_build_object(
          'action', 'Fixed orphan user - created user profile',
          'user_email', orphan_user.email,
          'user_name', v_user_name,
          'note', 'User needs manual team assignment by superadmin',
          'fixed_by', 'migration_phase_1'
        )
      );
      
      RETURN QUERY SELECT 
        orphan_user.id,
        orphan_user.email,
        'Created user profile - needs team assignment'::text,
        NULL::uuid,
        NULL::text;
    END IF;
  END LOOP;
END;
$$;

-- 3. Executar correção de usuários órfãos
SELECT * FROM fix_orphan_users();

-- 4. Criar função permanente para detectar usuários órfãos (para o SuperAdmin)
CREATE OR REPLACE FUNCTION get_orphan_users()
RETURNS TABLE(
  user_id uuid,
  email text,
  created_at timestamptz,
  has_profile boolean,
  has_team boolean,
  metadata jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    au.id,
    au.email,
    au.created_at,
    EXISTS(SELECT 1 FROM public.user_profiles up WHERE up.user_id = au.id) as has_profile,
    EXISTS(SELECT 1 FROM public.team_members tm WHERE tm.user_id = au.id AND tm.status = 'approved') as has_team,
    au.raw_user_meta_data as metadata
  FROM auth.users au
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles up WHERE up.user_id = au.id
  )
  OR NOT EXISTS (
    SELECT 1 FROM public.team_members tm WHERE tm.user_id = au.id AND tm.status = 'approved'
  )
  ORDER BY au.created_at DESC;
$$;

-- 5. Comentário final
COMMENT ON FUNCTION get_orphan_users() IS 'Retorna usuários órfãos (sem profile ou sem team aprovado). Usado pelo SuperAdmin para identificar e corrigir usuários incompletos.';

-- Limpar função temporária
DROP FUNCTION IF EXISTS fix_orphan_users();