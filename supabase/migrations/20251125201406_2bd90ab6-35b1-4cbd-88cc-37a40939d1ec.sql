-- Fix join_team_by_invite_code to ensure user profile exists before updating
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
  v_user_email TEXT;
  v_user_name TEXT;
  v_existing_status TEXT;
  v_profile_exists BOOLEAN;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Get user data from auth.users
  SELECT email, raw_user_meta_data->>'name' 
  INTO v_user_email, v_user_name
  FROM auth.users
  WHERE id = v_user_id;
  
  -- Find team by invite code
  SELECT id, name INTO v_team_id, v_team_name
  FROM public.teams
  WHERE invite_code = UPPER(p_invite_code);
  
  IF v_team_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;
  
  -- Check if user profile exists
  SELECT EXISTS(
    SELECT 1 FROM public.user_profiles WHERE user_id = v_user_id
  ) INTO v_profile_exists;
  
  -- Ensure user profile exists
  IF NOT v_profile_exists THEN
    INSERT INTO public.user_profiles (user_id, email, name, role, is_approved)
    VALUES (v_user_id, v_user_email, COALESCE(v_user_name, v_user_email, 'Usuário'), 'coordinator', false)
    ON CONFLICT (user_id) DO NOTHING;
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