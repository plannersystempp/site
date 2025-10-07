-- Drop the personnel_redacted view if it exists (since we have the secure function)
DROP VIEW IF EXISTS public.personnel_redacted;

-- The security is already properly handled by the get_personnel_redacted() function
-- which includes proper access controls: is_team_member(p.team_id) OR is_super_admin()
-- No additional changes needed as the function is already SECURITY DEFINER