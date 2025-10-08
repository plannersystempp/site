-- Migration to fix orphan coordinators and add Porfiro to FlorLaf team
-- This migration finds and fixes users who are coordinators but not in team_members

-- First, add Porfiro to FlorLaf team
INSERT INTO public.team_members (team_id, user_id, role, status, joined_at)
VALUES (
  '267da071-2027-40d3-96ec-9e4f1c088e7c'::uuid, -- FlorLaf team_id
  '6dd56448-37a8-449b-ab70-64bf049e35d6'::uuid, -- Porfiro's user_id
  'coordinator',
  'approved',
  now()
)
ON CONFLICT (team_id, user_id) DO UPDATE
SET 
  status = 'approved',
  role = 'coordinator';

-- Log the fix for audit
INSERT INTO public.audit_logs (
  user_id,
  team_id,
  action,
  table_name,
  record_id,
  new_values
)
VALUES (
  '6dd56448-37a8-449b-ab70-64bf049e35d6'::uuid,
  '267da071-2027-40d3-96ec-9e4f1c088e7c'::uuid,
  'TEAM_MEMBER_FIX',
  'team_members',
  '6dd56448-37a8-449b-ab70-64bf049e35d6'::text,
  jsonb_build_object(
    'action', 'Added orphan coordinator to team',
    'user_email', 'porfiro@laftech.com.br',
    'team_name', 'FlorLaf',
    'fixed_by', 'migration'
  )
);

-- Find and fix other orphan coordinators
-- This finds coordinators who are approved but not in any team
WITH orphan_coordinators AS (
  SELECT 
    up.user_id,
    up.email,
    up.name,
    up.role
  FROM public.user_profiles up
  WHERE up.role = 'coordinator'
    AND up.is_approved = true
    AND NOT EXISTS (
      SELECT 1 
      FROM public.team_members tm 
      WHERE tm.user_id = up.user_id 
        AND tm.status = 'approved'
    )
),
team_info AS (
  -- Try to find which team they should belong to based on audit logs or team ownership
  SELECT DISTINCT ON (oc.user_id)
    oc.user_id,
    oc.email,
    oc.name,
    COALESCE(
      (SELECT team_id FROM public.audit_logs al 
       WHERE al.user_id = oc.user_id 
       ORDER BY created_at DESC LIMIT 1),
      (SELECT id FROM public.teams ORDER BY created_at LIMIT 1)
    ) as suggested_team_id
  FROM orphan_coordinators oc
)
-- Insert orphan coordinators into teams
INSERT INTO public.team_members (team_id, user_id, role, status, joined_at)
SELECT 
  ti.suggested_team_id,
  ti.user_id,
  'coordinator',
  'approved',
  now()
FROM team_info ti
WHERE ti.suggested_team_id IS NOT NULL
ON CONFLICT (team_id, user_id) DO UPDATE
SET 
  status = 'approved',
  role = 'coordinator';

-- Create a function to prevent orphan coordinators in the future
CREATE OR REPLACE FUNCTION public.prevent_orphan_coordinators()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a user_profile is updated to coordinator and approved
  IF NEW.role = 'coordinator' AND NEW.is_approved = true THEN
    -- Check if user is in any team
    IF NOT EXISTS (
      SELECT 1 
      FROM public.team_members 
      WHERE user_id = NEW.user_id 
        AND status = 'approved'
    ) THEN
      -- Log warning
      RAISE WARNING 'Coordinator % (%) is not in any team', NEW.name, NEW.email;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to check for orphan coordinators
DROP TRIGGER IF EXISTS check_orphan_coordinators ON public.user_profiles;
CREATE TRIGGER check_orphan_coordinators
  AFTER INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW
  WHEN (NEW.role = 'coordinator' AND NEW.is_approved = true)
  EXECUTE FUNCTION public.prevent_orphan_coordinators();