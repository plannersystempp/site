-- Security fixes for personnel data protection and audit log restrictions

-- 1. PERSONNEL DATA PROTECTION
-- Update personnel SELECT policy to restrict to admin/superadmin only
DROP POLICY IF EXISTS "Admins and coordinators can view personnel OR super admin" ON public.personnel;

CREATE POLICY "Only admins and superadmin can view personnel data" 
ON public.personnel 
FOR SELECT 
USING (is_super_admin() OR get_user_role_in_team(team_id) = 'admin');

-- Create redacted view for coordinators with masked sensitive data
CREATE OR REPLACE VIEW public.personnel_redacted AS
SELECT 
  id,
  team_id,
  name,
  type,
  created_at,
  -- Masked email (show first letter and domain)
  CASE 
    WHEN email IS NOT NULL AND email != '' THEN 
      LEFT(email, 1) || '***@' || SPLIT_PART(email, '@', 2)
    ELSE NULL 
  END as email_masked,
  -- Masked phone (show first 2 and last 2 digits)
  CASE 
    WHEN phone IS NOT NULL AND phone != '' THEN 
      LEFT(phone, 2) || '***' || RIGHT(phone, 2)
    ELSE NULL 
  END as phone_masked,
  -- Masked CPF (format: ***.***.***-**)
  CASE 
    WHEN cpf IS NOT NULL AND cpf != '' THEN '***.***.***-**'
    ELSE NULL 
  END as cpf_masked,
  -- Masked CNPJ (format: **.***.***/****-**)
  CASE 
    WHEN cnpj IS NOT NULL AND cnpj != '' THEN '**.***.***/****-**'
    ELSE NULL 
  END as cnpj_masked,
  -- Salary range instead of exact amounts
  CASE 
    WHEN monthly_salary = 0 THEN 'Não informado'
    WHEN monthly_salary <= 2000 THEN 'Até R$ 2.000'
    WHEN monthly_salary <= 5000 THEN 'R$ 2.001 - R$ 5.000'
    WHEN monthly_salary <= 10000 THEN 'R$ 5.001 - R$ 10.000'
    ELSE 'Acima de R$ 10.000'
  END as salary_range
FROM public.personnel;

-- Enable RLS on the redacted view
ALTER VIEW public.personnel_redacted SET (security_invoker = true);

-- Grant access to the redacted view for coordinators and admins
GRANT SELECT ON public.personnel_redacted TO authenticated;

-- 2. AUDIT LOGS RESTRICTION
-- Update audit logs policy to restrict to superadmins only
DROP POLICY IF EXISTS "Superadmin can view all audit logs OR admins can view team logs" ON public.audit_logs;

CREATE POLICY "Only superadmin can view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (is_super_admin());

-- 3. FIX SEARCH_PATH IN SECURITY DEFINER FUNCTIONS
-- Update functions that are missing proper search_path

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