-- Fix Critical Security Issues

-- 1. Fix get_current_user_role function to remove hardcoded admin email
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
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

-- 2. Add RLS policies for logs_checklist table
CREATE POLICY "Team members can view logs" 
ON public.logs_checklist 
FOR SELECT 
USING (
  demanda_id IN (
    SELECT events.id FROM public.events 
    WHERE events.team_id IN (
      SELECT teams.id FROM public.teams WHERE teams.owner_id = auth.uid()
      UNION
      SELECT team_members.team_id FROM public.team_members 
      WHERE team_members.user_id = auth.uid() AND team_members.status = 'approved'
    )
  )
);

CREATE POLICY "Team members can insert logs" 
ON public.logs_checklist 
FOR INSERT 
WITH CHECK (
  demanda_id IN (
    SELECT events.id FROM public.events 
    WHERE events.team_id IN (
      SELECT teams.id FROM public.teams WHERE teams.owner_id = auth.uid()
      UNION
      SELECT team_members.team_id FROM public.team_members 
      WHERE team_members.user_id = auth.uid() AND team_members.status = 'approved'
    )
  )
);

-- 3. Create a secure function to check admin permissions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin' 
    AND is_approved = true
  )
$function$;

-- 4. Create audit trigger for role changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $function$
BEGIN
  -- Only allow admins to change roles
  IF NOT public.is_admin() THEN
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

-- Create trigger for user_profiles role changes
DROP TRIGGER IF EXISTS audit_role_changes_trigger ON public.user_profiles;
CREATE TRIGGER audit_role_changes_trigger
  BEFORE UPDATE OF role, is_approved ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_role_changes();

-- 5. Update user_profiles RLS policies to be more secure
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
CREATE POLICY "Admins can view all profiles" 
ON public.user_profiles 
FOR ALL
USING (public.is_admin() OR user_id = auth.uid())
WITH CHECK (public.is_admin() OR user_id = auth.uid());

-- 6. Add password validation function
CREATE OR REPLACE FUNCTION public.validate_password(password text)
RETURNS boolean
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Check minimum length
  IF length(password) < 8 THEN
    RETURN false;
  END IF;
  
  -- Check for at least one uppercase letter
  IF password !~ '[A-Z]' THEN
    RETURN false;
  END IF;
  
  -- Check for at least one lowercase letter
  IF password !~ '[a-z]' THEN
    RETURN false;
  END IF;
  
  -- Check for at least one number
  IF password !~ '[0-9]' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$function$;