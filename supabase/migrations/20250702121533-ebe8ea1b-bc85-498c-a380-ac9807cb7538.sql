-- Fix RLS policies for user_approvals table to prevent infinite recursion
DROP POLICY IF EXISTS "Admins can manage all approvals" ON user_approvals;

-- Create a simpler admin policy that doesn't cause recursion
CREATE POLICY "Admins can manage all approvals" 
ON user_approvals 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.role = 'admin' 
    AND user_profiles.is_approved = true
  )
  OR 
  (auth.jwt() ->> 'email') = 'admin@exemplo.com'
);

-- Ensure the policy allows admins to see all records
CREATE POLICY "Admins can see all approval records" 
ON user_approvals 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.role = 'admin' 
    AND user_profiles.is_approved = true
  )
  OR 
  (auth.jwt() ->> 'email') = 'admin@exemplo.com'
);