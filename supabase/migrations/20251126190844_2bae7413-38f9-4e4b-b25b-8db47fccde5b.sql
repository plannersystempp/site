-- Fix get_orphan_users function to not classify pending users as orphans
-- Users with ANY team_members record (pending, approved, rejected) should not be orphans

CREATE OR REPLACE FUNCTION public.get_orphan_users()
RETURNS TABLE(
  user_id uuid,
  email text,
  created_at timestamp with time zone,
  has_profile boolean,
  has_team boolean,
  metadata jsonb
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    au.id,
    au.email,
    au.created_at,
    EXISTS(SELECT 1 FROM public.user_profiles up WHERE up.user_id = au.id) as has_profile,
    -- Changed: Consider ANY team_members record as having a team (not just approved)
    EXISTS(SELECT 1 FROM public.team_members tm WHERE tm.user_id = au.id) as has_team,
    au.raw_user_meta_data as metadata
  FROM auth.users au
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles up WHERE up.user_id = au.id
  )
  OR NOT EXISTS (
    -- Changed: Removed status = 'approved' condition
    -- Users with pending/rejected status are NOT orphans, they're in a workflow
    SELECT 1 FROM public.team_members tm WHERE tm.user_id = au.id
  )
  ORDER BY au.created_at DESC;
$function$;