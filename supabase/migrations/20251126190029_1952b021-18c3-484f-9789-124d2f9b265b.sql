-- Fix RLS policy to allow approved team members to view pending users
-- This is critical for the team member approval workflow

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Team members can view team profiles OR super admin" ON user_profiles;

-- Create new policy that allows approved members to see all team members (including pending)
CREATE POLICY "Team members can view team profiles OR super admin" ON user_profiles
FOR SELECT USING (
  -- Users can always view their own profile
  (auth.uid() = user_id) 
  OR 
  -- Superadmins can view all profiles
  is_super_admin() 
  OR 
  -- Approved team members can view other team members (regardless of their status)
  (EXISTS (
    SELECT 1
    FROM team_members tm1
    JOIN team_members tm2 ON (tm1.team_id = tm2.team_id)
    WHERE tm1.user_id = auth.uid() 
      AND tm2.user_id = user_profiles.user_id 
      AND tm1.status = 'approved'
      -- Removed: AND tm2.status = 'approved'
      -- This allows approved admins to see pending members for approval workflow
  ))
);