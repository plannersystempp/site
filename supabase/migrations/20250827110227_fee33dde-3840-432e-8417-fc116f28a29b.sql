-- Phase 1: Critical Database Integrity Improvements

-- Add unique constraints to prevent data inconsistency
ALTER TABLE public.event_divisions ADD CONSTRAINT event_divisions_event_name_unique UNIQUE (event_id, name);
ALTER TABLE public.functions ADD CONSTRAINT functions_team_name_unique UNIQUE (team_id, name);
ALTER TABLE public.payroll_closings ADD CONSTRAINT payroll_closings_event_personnel_unique UNIQUE (event_id, personnel_id);

-- Add performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_personnel_allocations_event_personnel ON public.personnel_allocations (event_id, personnel_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_personnel_allocations_division ON public.personnel_allocations (division_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_work_records_event_employee ON public.work_records (event_id, employee_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_work_records_date ON public.work_records (work_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_freelancer_ratings_freelancer ON public.freelancer_ratings (freelancer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_team_action ON public.audit_logs (team_id, action);

-- Enhanced audit logging function for comprehensive tracking
CREATE OR REPLACE FUNCTION public.enhanced_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  current_team_id uuid;
BEGIN
  -- Extract team_id from the record if it exists
  current_team_id := COALESCE(
    COALESCE(NEW.team_id, OLD.team_id),
    CASE 
      WHEN TG_TABLE_NAME = 'teams' THEN COALESCE(NEW.id, OLD.id)
      ELSE NULL
    END
  );

  -- Insert audit log
  INSERT INTO public.audit_logs (
    user_id, 
    team_id,
    action, 
    table_name, 
    record_id, 
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    current_team_id,
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD)::jsonb ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::jsonb ELSE NULL END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add audit triggers to critical tables
DROP TRIGGER IF EXISTS audit_events ON public.events;
CREATE TRIGGER audit_events
  AFTER INSERT OR UPDATE OR DELETE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_audit_log();

DROP TRIGGER IF EXISTS audit_personnel ON public.personnel;
CREATE TRIGGER audit_personnel
  AFTER INSERT OR UPDATE OR DELETE ON public.personnel
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_audit_log();

DROP TRIGGER IF EXISTS audit_personnel_allocations ON public.personnel_allocations;
CREATE TRIGGER audit_personnel_allocations
  AFTER INSERT OR UPDATE OR DELETE ON public.personnel_allocations
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_audit_log();

DROP TRIGGER IF EXISTS audit_work_records ON public.work_records;
CREATE TRIGGER audit_work_records
  AFTER INSERT OR UPDATE OR DELETE ON public.work_records
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_audit_log();

DROP TRIGGER IF EXISTS audit_payroll_closings ON public.payroll_closings;
CREATE TRIGGER audit_payroll_closings
  AFTER INSERT OR UPDATE OR DELETE ON public.payroll_closings
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_audit_log();

-- Enhanced data validation function
CREATE OR REPLACE FUNCTION public.validate_business_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- Event date validation
  IF TG_TABLE_NAME = 'events' THEN
    IF NEW.start_date IS NOT NULL AND NEW.end_date IS NOT NULL AND NEW.start_date > NEW.end_date THEN
      RAISE EXCEPTION 'Event start date cannot be after end date';
    END IF;
  END IF;

  -- Work record validation
  IF TG_TABLE_NAME = 'work_records' THEN
    IF NEW.hours_worked < 0 OR NEW.overtime_hours < 0 THEN
      RAISE EXCEPTION 'Work hours cannot be negative';
    END IF;
    
    IF NEW.total_pay < 0 THEN
      RAISE EXCEPTION 'Total pay cannot be negative';
    END IF;
  END IF;

  -- Personnel allocation validation (enhanced)
  IF TG_TABLE_NAME = 'personnel_allocations' THEN
    IF array_length(NEW.work_days, 1) = 0 THEN
      RAISE EXCEPTION 'At least one work day must be selected';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Add validation triggers
DROP TRIGGER IF EXISTS validate_events ON public.events;
CREATE TRIGGER validate_events
  BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.validate_business_rules();

DROP TRIGGER IF EXISTS validate_work_records ON public.work_records;
CREATE TRIGGER validate_work_records
  BEFORE INSERT OR UPDATE ON public.work_records
  FOR EACH ROW EXECUTE FUNCTION public.validate_business_rules();

DROP TRIGGER IF EXISTS validate_personnel_allocations ON public.personnel_allocations;
CREATE TRIGGER validate_personnel_allocations
  BEFORE INSERT OR UPDATE ON public.personnel_allocations
  FOR EACH ROW EXECUTE FUNCTION public.validate_business_rules();

-- Enhance RLS policies for better security
-- Update personnel allocation policy to prevent duplicate allocations
DROP POLICY IF EXISTS "Membros da equipe podem inserir alocações" ON public.personnel_allocations;
CREATE POLICY "Membros da equipe podem inserir alocações" 
ON public.personnel_allocations 
FOR INSERT 
WITH CHECK (
  is_team_member(team_id) AND
  NOT EXISTS (
    SELECT 1 FROM public.personnel_allocations pa
    WHERE pa.personnel_id = personnel_allocations.personnel_id 
    AND pa.event_id = personnel_allocations.event_id 
    AND pa.work_days && personnel_allocations.work_days
    AND pa.id != personnel_allocations.id
  )
);

-- Add function to get team statistics
CREATE OR REPLACE FUNCTION public.get_team_statistics(team_id_param uuid)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT jsonb_build_object(
    'total_events', (SELECT COUNT(*) FROM public.events WHERE team_id = team_id_param),
    'active_events', (SELECT COUNT(*) FROM public.events WHERE team_id = team_id_param AND status IN ('planejado', 'em_andamento')),
    'total_personnel', (SELECT COUNT(*) FROM public.personnel WHERE team_id = team_id_param),
    'freelancers_count', (SELECT COUNT(*) FROM public.personnel WHERE team_id = team_id_param AND type = 'freelancer'),
    'fixed_personnel_count', (SELECT COUNT(*) FROM public.personnel WHERE team_id = team_id_param AND type = 'fixo'),
    'pending_payments', (
      SELECT COUNT(*) 
      FROM public.work_records wr 
      WHERE wr.team_id = team_id_param AND wr.paid = false
    )
  )
  WHERE is_team_member(team_id_param);
$$;