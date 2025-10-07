-- Fix RLS policies and create helper functions for better authentication flow

-- 1. Create function to ensure user profile exists
CREATE OR REPLACE FUNCTION public.ensure_user_profile(
  p_user_id UUID,
  p_email TEXT,
  p_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  v_profile_id UUID;
BEGIN
  -- Check if profile exists
  SELECT id INTO v_profile_id
  FROM public.user_profiles 
  WHERE user_id = p_user_id;
  
  -- If profile doesn't exist, create it
  IF v_profile_id IS NULL THEN
    INSERT INTO public.user_profiles (user_id, email, name, role, is_approved)
    VALUES (p_user_id, p_email, p_name, 'user', false)
    RETURNING id INTO v_profile_id;
  END IF;
  
  RETURN v_profile_id;
END;
$$;

-- 2. Create function to setup company for current user
CREATE OR REPLACE FUNCTION public.setup_company_for_current_user(
  p_company_name TEXT,
  p_company_cnpj TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  v_team_id UUID;
  v_invite_code TEXT;
  v_user_id UUID;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Generate unique invite code
  v_invite_code := UPPER(substring(md5(random()::text) from 1 for 8));
  
  -- Create team
  INSERT INTO public.teams (name, cnpj, owner_id, invite_code)
  VALUES (p_company_name, p_company_cnpj, v_user_id, v_invite_code)
  RETURNING id INTO v_team_id;
  
  -- Add user as admin member
  INSERT INTO public.team_members (team_id, user_id, role, status)
  VALUES (v_team_id, v_user_id, 'admin', 'approved');
  
  -- Update user profile to admin
  UPDATE public.user_profiles 
  SET role = 'admin', is_approved = true
  WHERE user_id = v_user_id;
  
  -- Return team info
  RETURN jsonb_build_object(
    'team_id', v_team_id,
    'invite_code', v_invite_code,
    'success', true
  );
END;
$$;

-- 3. Create function to join team by invite code
CREATE OR REPLACE FUNCTION public.join_team_by_invite_code(
  p_invite_code TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  v_team_id UUID;
  v_team_name TEXT;
  v_user_id UUID;
  v_existing_status TEXT;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Find team by invite code
  SELECT id, name INTO v_team_id, v_team_name
  FROM public.teams
  WHERE invite_code = UPPER(p_invite_code);
  
  IF v_team_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;
  
  -- Check if user is already a member
  SELECT status INTO v_existing_status
  FROM public.team_members
  WHERE team_id = v_team_id AND user_id = v_user_id;
  
  IF v_existing_status IS NULL THEN
    -- Add as pending member
    INSERT INTO public.team_members (team_id, user_id, role, status, joined_with_code)
    VALUES (v_team_id, v_user_id, 'coordinator', 'pending', UPPER(p_invite_code));
    
    v_existing_status := 'pending';
  END IF;
  
  -- Update user profile to coordinator (pending approval)
  UPDATE public.user_profiles 
  SET role = 'coordinator', is_approved = false
  WHERE user_id = v_user_id;
  
  RETURN jsonb_build_object(
    'team_id', v_team_id,
    'team_name', v_team_name,
    'status', v_existing_status,
    'success', true
  );
END;
$$;

-- 4. Fix teams RLS policy to allow owners to see their teams
DROP POLICY IF EXISTS "Team members can view their teams OR super admin can view all" ON public.teams;

CREATE POLICY "Team owners and members can view their teams OR super admin"
ON public.teams
FOR SELECT
USING (
  is_super_admin() OR 
  owner_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_id = teams.id 
    AND user_id = auth.uid() 
    AND status = 'approved'
  )
);

-- 5. Ensure user_profiles has proper RLS for self-updates
DROP POLICY IF EXISTS "Users can update their own basic profile data" ON public.user_profiles;

CREATE POLICY "Users can update their own profile data"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. Allow users to insert their own profile (for cases where trigger doesn't work)
CREATE POLICY "Users can insert their own profile"
ON public.user_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);