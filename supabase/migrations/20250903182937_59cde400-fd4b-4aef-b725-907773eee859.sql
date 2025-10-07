-- CRITICAL SECURITY FIXES

-- 1. Fix enforce_user_profile_update function to handle both INSERT and UPDATE
-- and add proper search_path security
CREATE OR REPLACE FUNCTION public.enforce_user_profile_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $function$
DECLARE
  current_user_role text;
BEGIN
  -- Get current user's role (only for existing users)
  SELECT role INTO current_user_role 
  FROM public.user_profiles 
  WHERE user_id = auth.uid() AND is_approved = true;
  
  -- For INSERT operations, force role='user' and is_approved=false unless user is admin/superadmin
  IF TG_OP = 'INSERT' THEN
    -- Only allow INSERT if user doesn't already have a profile
    IF EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = NEW.user_id) THEN
      RAISE EXCEPTION 'User profile already exists';
    END IF;
    
    -- Force safe defaults for new profiles unless current user is admin/superadmin
    IF current_user_role NOT IN ('admin', 'superadmin') THEN
      NEW.role := 'user';
      NEW.is_approved := false;
    END IF;
  END IF;
  
  -- For UPDATE operations, prevent non-admin users from changing role or approval status
  IF TG_OP = 'UPDATE' AND (OLD.role != NEW.role OR OLD.is_approved != NEW.is_approved) THEN
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
$function$;

-- 2. Create triggers on user_profiles to enforce security
DROP TRIGGER IF EXISTS enforce_user_profile_security ON public.user_profiles;
CREATE TRIGGER enforce_user_profile_security
  BEFORE INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_user_profile_update();

DROP TRIGGER IF EXISTS audit_user_profile_changes ON public.user_profiles;
CREATE TRIGGER audit_user_profile_changes
  BEFORE UPDATE OF role, is_approved ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_role_changes();

-- 3. Drop the dangerous INSERT policy on user_profiles
-- Profile creation should only happen through SECURITY DEFINER functions
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;

-- 4. Drop the dangerous INSERT policy on audit_logs
-- Only system functions should write audit logs
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios logs de auditoria" ON public.audit_logs;

-- 5. Restrict financial data access to admins only
DROP POLICY IF EXISTS "Admins and coordinators can view payroll closings OR super admi" ON public.payroll_closings;
CREATE POLICY "Only admins can view payroll closings"
ON public.payroll_closings
FOR SELECT
USING (is_super_admin() OR (get_user_role_in_team(team_id) = 'admin'));

DROP POLICY IF EXISTS "Admins and coordinators can view work records OR super admin" ON public.work_records;
CREATE POLICY "Only admins can view work records"
ON public.work_records
FOR SELECT
USING (is_super_admin() OR (get_user_role_in_team(team_id) = 'admin'));

-- 6. Fix function security settings for linter warnings
CREATE OR REPLACE FUNCTION public.absences_set_defaults_validate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $function$
BEGIN
  IF NEW.logged_by_id IS NULL THEN
    NEW.logged_by_id := auth.uid();
  END IF;

  IF NEW.created_at IS NULL THEN
    NEW.created_at := now();
  END IF;

  -- Validations
  IF NEW.work_date IS NULL THEN
    RAISE EXCEPTION 'work_date é obrigatório';
  END IF;

  RETURN NEW;
END;
$function$;

-- 7. Update audit_role_changes function with proper search_path
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $function$
DECLARE
  current_user_role text;
BEGIN
  -- Get current user's role
  SELECT role INTO current_user_role 
  FROM public.user_profiles 
  WHERE user_id = auth.uid() AND is_approved = true;
  
  -- Role hierarchy validation
  IF current_user_role = 'admin' THEN
    -- Admins cannot create or modify superadmin roles
    IF NEW.role = 'superadmin' THEN
      RAISE EXCEPTION 'Admins cannot create or modify superadmin roles';
    END IF;
    
    -- Admins cannot modify other admin roles (including their own to prevent self-elevation)
    IF OLD.role = 'admin' AND NEW.role != OLD.role THEN
      RAISE EXCEPTION 'Admins cannot modify admin roles';
    END IF;
  ELSIF current_user_role != 'superadmin' THEN
    -- Only admins and superadmins can change roles
    RAISE EXCEPTION 'Only administrators can modify user roles';
  END IF;
  
  -- Log the role change
  INSERT INTO public.audit_logs (
    user_id, 
    action, 
    table_name, 
    record_id, 
    old_values, 
    new_values
  ) VALUES (
    auth.uid(),
    'ROLE_UPDATE',
    'user_profiles',
    NEW.id::text,
    jsonb_build_object('role', OLD.role, 'is_approved', OLD.is_approved),
    jsonb_build_object('role', NEW.role, 'is_approved', NEW.is_approved)
  );
  
  RETURN NEW;
END;
$function$;