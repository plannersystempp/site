-- Security Fix 1: Harden user_profiles table
-- Drop the overly permissive ALL policy
DROP POLICY IF EXISTS "Usuários podem ver e atualizar seu próprio perfil" ON public.user_profiles;

-- Create granular policies for user_profiles
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own basic profile data" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Security Fix 2: Fix audit_logs policy to prevent exposure
DROP POLICY IF EXISTS "Admins podem visualizar logs de auditoria de suas equipes OR su" ON public.audit_logs;

CREATE POLICY "Superadmin can view all audit logs OR admins can view team logs" 
ON public.audit_logs 
FOR SELECT 
USING (
  is_super_admin() OR 
  (team_id IS NOT NULL AND get_user_role_in_team(team_id) = 'admin')
);

-- Security Fix 3: Restrict sensitive data access
-- Update personnel table to require admin/coordinator role
DROP POLICY IF EXISTS "Membros da equipe podem visualizar o pessoal OR super admin" ON public.personnel;

CREATE POLICY "Admins and coordinators can view personnel OR super admin" 
ON public.personnel 
FOR SELECT 
USING (
  is_super_admin() OR 
  get_user_role_in_team(team_id) IN ('admin', 'coordinator')
);

-- Update payroll_closings table 
DROP POLICY IF EXISTS "Membros da equipe podem visualizar fechamentos de folha de paga" ON public.payroll_closings;

CREATE POLICY "Admins and coordinators can view payroll closings OR super admin" 
ON public.payroll_closings 
FOR SELECT 
USING (
  is_super_admin() OR 
  get_user_role_in_team(team_id) IN ('admin', 'coordinator')
);

-- Update work_records table
DROP POLICY IF EXISTS "Membros da equipe podem visualizar registros de trabalho OR sup" ON public.work_records;

CREATE POLICY "Admins and coordinators can view work records OR super admin" 
ON public.work_records 
FOR SELECT 
USING (
  is_super_admin() OR 
  get_user_role_in_team(team_id) IN ('admin', 'coordinator')
);

-- Security Fix 4: Create function to enforce user profile updates
CREATE OR REPLACE FUNCTION public.enforce_user_profile_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  current_user_role text;
BEGIN
  -- Get current user's role
  SELECT role INTO current_user_role 
  FROM public.user_profiles 
  WHERE user_id = auth.uid() AND is_approved = true;
  
  -- Prevent non-admin users from changing role or approval status
  IF (OLD.role != NEW.role OR OLD.is_approved != NEW.is_approved) THEN
    -- Only admins and superadmins can change roles/approval
    IF current_user_role NOT IN ('admin', 'superadmin') THEN
      RAISE EXCEPTION 'Only administrators can modify user roles or approval status';
    END IF;
    
    -- Prevent admins from creating/modifying superadmin roles
    IF current_user_role = 'admin' AND NEW.role = 'superadmin' THEN
      RAISE EXCEPTION 'Admins cannot create or modify superadmin roles';
    END IF;
    
    -- Log the change
    INSERT INTO public.audit_logs (
      user_id, 
      action, 
      table_name, 
      record_id, 
      old_values, 
      new_values
    ) VALUES (
      auth.uid(),
      'PROFILE_ROLE_UPDATE',
      'user_profiles',
      NEW.id::text,
      jsonb_build_object('role', OLD.role, 'is_approved', OLD.is_approved),
      jsonb_build_object('role', NEW.role, 'is_approved', NEW.is_approved)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add trigger to enforce user profile update rules
DROP TRIGGER IF EXISTS enforce_user_profile_update_trigger ON public.user_profiles;
CREATE TRIGGER enforce_user_profile_update_trigger
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_user_profile_update();

-- Security Fix 5: Harden database functions with explicit search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT 
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_id = auth.uid() 
        AND role = 'admin' 
        AND is_approved = true
      ) THEN 'admin'
      ELSE 'user'
    END
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin' 
    AND is_approved = true
  )
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'superadmin'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_team_member(check_team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.team_members 
    WHERE team_id = check_team_id 
    AND user_id = auth.uid()
    AND status = 'approved'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_role_in_team(check_team_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT role 
  FROM public.team_members 
  WHERE team_id = check_team_id 
  AND user_id = auth.uid()
  AND status = 'approved'
  LIMIT 1;
$$;