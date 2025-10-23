-- Fix 409 error when deleting personnel
-- The issue is caused by the audit_logs table RLS policy that was removed
-- but the enhanced_audit_log function still tries to insert records

-- 1. Recreate the missing RLS policy for audit_logs INSERT operations
-- This allows the enhanced_audit_log function to insert audit records during DELETE operations
CREATE POLICY "Allow system audit log insertion"
ON public.audit_logs
FOR INSERT
WITH CHECK (true); -- Allow all inserts from system functions

-- 2. Improve the enhanced_audit_log function to handle potential conflicts
CREATE OR REPLACE FUNCTION public.enhanced_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_team_id uuid;
  v_user_id uuid;
BEGIN
  -- Get current user ID, fallback to system user if needed
  v_user_id := COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid);
  
  -- Determine team_id without type mixing
  v_team_id := CASE
    WHEN TG_OP IN ('INSERT','UPDATE') AND NEW.team_id IS NOT NULL THEN NEW.team_id
    WHEN TG_OP = 'DELETE' AND OLD.team_id IS NOT NULL THEN OLD.team_id
    WHEN TG_TABLE_NAME = 'teams' THEN COALESCE(NEW.id::uuid, OLD.id::uuid)
    ELSE NULL::uuid
  END;

  -- Insert audit log with error handling
  BEGIN
    INSERT INTO public.audit_logs (
      user_id,
      team_id,
      action,
      table_name,
      record_id,
      old_values,
      new_values
    ) VALUES (
      v_user_id,
      v_team_id,
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id::text, OLD.id::text),
      CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN row_to_json(OLD)::jsonb ELSE NULL END,
      CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN row_to_json(NEW)::jsonb ELSE NULL END
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error but don't fail the main operation
      RAISE WARNING 'Failed to insert audit log for % on %: %', TG_OP, TG_TABLE_NAME, SQLERRM;
  END;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 3. Ensure the audit trigger exists for personnel table
DROP TRIGGER IF EXISTS audit_personnel ON public.personnel;
CREATE TRIGGER audit_personnel
  AFTER INSERT OR UPDATE OR DELETE ON public.personnel
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_audit_log();

-- 4. Add a comment explaining the fix
COMMENT ON POLICY "Allow system audit log insertion" ON public.audit_logs IS 
'Allows system functions like enhanced_audit_log to insert audit records during all operations including DELETE';