-- Fix security issue: Restrict personnel INSERT to admins only
-- Currently any team member can insert personnel with sensitive data (CPF, salary, etc.)
-- This should be restricted to admins only for better security

-- Drop the existing overly permissive INSERT policy
DROP POLICY IF EXISTS "Membros da equipe podem adicionar novo pessoal" ON public.personnel;

-- Create a new restrictive INSERT policy - only admins can add personnel
CREATE POLICY "Only admins can add personnel with sensitive data" 
ON public.personnel 
FOR INSERT 
WITH CHECK (get_user_role_in_team(team_id) = 'admin');

-- Also add validation trigger to ensure sensitive data handling
CREATE OR REPLACE FUNCTION public.validate_personnel_sensitive_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- Validate CPF format (basic validation)
  IF NEW.cpf IS NOT NULL AND LENGTH(NEW.cpf) > 0 THEN
    IF LENGTH(REPLACE(REPLACE(REPLACE(NEW.cpf, '.', ''), '-', ''), '/', '')) != 11 THEN
      RAISE EXCEPTION 'CPF must be 11 digits';
    END IF;
  END IF;
  
  -- Validate CNPJ format (basic validation)
  IF NEW.cnpj IS NOT NULL AND LENGTH(NEW.cnpj) > 0 THEN
    IF LENGTH(REPLACE(REPLACE(REPLACE(NEW.cnpj, '.', ''), '-', ''), '/', '')) != 14 THEN
      RAISE EXCEPTION 'CNPJ must be 14 digits';
    END IF;
  END IF;
  
  -- Ensure salary values are not negative
  IF NEW.monthly_salary < 0 OR NEW.event_cache < 0 OR NEW.overtime_rate < 0 THEN
    RAISE EXCEPTION 'Salary values cannot be negative';
  END IF;
  
  -- Log personnel creation for audit trail
  INSERT INTO public.audit_logs (
    user_id, 
    team_id,
    action, 
    table_name, 
    record_id, 
    new_values
  ) VALUES (
    auth.uid(),
    NEW.team_id,
    'PERSONNEL_CREATE',
    'personnel',
    NEW.id::text,
    jsonb_build_object(
      'name', NEW.name,
      'type', NEW.type,
      'has_cpf', (NEW.cpf IS NOT NULL AND LENGTH(NEW.cpf) > 0),
      'has_cnpj', (NEW.cnpj IS NOT NULL AND LENGTH(NEW.cnpj) > 0),
      'monthly_salary', NEW.monthly_salary
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for personnel validation
DROP TRIGGER IF EXISTS validate_personnel_data ON public.personnel;
CREATE TRIGGER validate_personnel_data
  BEFORE INSERT OR UPDATE ON public.personnel
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_personnel_sensitive_data();