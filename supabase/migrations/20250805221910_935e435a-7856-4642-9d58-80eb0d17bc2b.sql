-- Fix database function security by updating search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Update get_current_user_role with proper search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- Update is_admin with proper search_path
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin' 
    AND is_approved = true
  )
$function$;

-- Update is_super_admin with proper search_path
CREATE OR REPLACE FUNCTION public.is_super_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'superadmin'
  )
$function$;

-- Enhanced audit_role_changes function with role hierarchy validation
CREATE OR REPLACE FUNCTION public.audit_role_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
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

-- Update other functions with proper search_path
CREATE OR REPLACE FUNCTION public.is_team_member(check_team_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.team_members 
    WHERE team_id = check_team_id 
    AND user_id = auth.uid()
    AND status = 'approved'
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role_in_team(check_team_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT role 
  FROM public.team_members 
  WHERE team_id = check_team_id 
  AND user_id = auth.uid()
  AND status = 'approved'
  LIMIT 1;
$function$;

-- Add trigger to user_profiles table for role change auditing
DROP TRIGGER IF EXISTS audit_role_changes_trigger ON public.user_profiles;
CREATE TRIGGER audit_role_changes_trigger
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role OR OLD.is_approved IS DISTINCT FROM NEW.is_approved)
  EXECUTE FUNCTION public.audit_role_changes();