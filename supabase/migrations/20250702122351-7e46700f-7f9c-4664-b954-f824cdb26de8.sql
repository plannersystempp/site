-- Fix infinite recursion in user_profiles RLS policies
-- The issue is that the admin policy is referencing user_profiles table within itself

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;

-- Create a security definer function to check admin role without recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT 
    CASE 
      WHEN (auth.jwt() ->> 'email') = 'admin@exemplo.com' THEN 'admin'
      ELSE 'user'
    END
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create new admin policy using the function instead of direct table query
CREATE POLICY "Admins can view all profiles" 
ON user_profiles 
FOR ALL 
TO authenticated 
USING (
  public.get_current_user_role() = 'admin'
  OR user_id = auth.uid()
)
WITH CHECK (
  public.get_current_user_role() = 'admin'
  OR user_id = auth.uid()
);