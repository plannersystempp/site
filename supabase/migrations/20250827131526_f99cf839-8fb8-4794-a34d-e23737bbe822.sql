
-- 1) Corrigir função de auditoria para evitar COALESCE entre uuid e bigint
CREATE OR REPLACE FUNCTION public.enhanced_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_team_id uuid;
BEGIN
  -- Determina team_id sem misturar tipos
  v_team_id := CASE
    WHEN TG_OP IN ('INSERT','UPDATE') AND NEW.team_id IS NOT NULL THEN NEW.team_id
    WHEN TG_OP = 'DELETE' AND OLD.team_id IS NOT NULL THEN OLD.team_id
    WHEN TG_TABLE_NAME = 'teams' THEN COALESCE(NEW.id::uuid, OLD.id::uuid)
    ELSE NULL::uuid
  END;

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
    v_team_id,
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN row_to_json(OLD)::jsonb ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN row_to_json(NEW)::jsonb ELSE NULL END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 2) Padronizar trigger de defaults/validação em absences (inclui comparação de data correta)
DROP TRIGGER IF EXISTS absences_set_defaults ON public.absences;
DROP TRIGGER IF EXISTS set_absences_defaults ON public.absences;

CREATE OR REPLACE FUNCTION public.absences_set_defaults_validate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_team_id uuid;
  v_valid_date boolean;
BEGIN
  -- Preenche team_id a partir da alocação
  SELECT pa.team_id INTO v_team_id
  FROM public.personnel_allocations pa
  WHERE pa.id = NEW.assignment_id;

  IF v_team_id IS NULL THEN
    RAISE EXCEPTION 'Invalid assignment_id: allocation not found';
  END IF;

  NEW.team_id := v_team_id;

  -- Define logged_by_id = auth.uid() se não informado
  IF NEW.logged_by_id IS NULL THEN
    NEW.logged_by_id := auth.uid();
  END IF;

  -- Valida se a data informada pertence aos dias de trabalho da alocação
  -- Compara como texto, pois work_days é text[]
  SELECT EXISTS (
    SELECT 1
    FROM public.personnel_allocations pa
    WHERE pa.id = NEW.assignment_id
      AND NEW.work_date::text = ANY(pa.work_days)
  ) INTO v_valid_date;

  IF NOT v_valid_date THEN
    RAISE EXCEPTION 'A data informada (%), não pertence aos dias de trabalho desta alocação', NEW.work_date;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE TRIGGER absences_set_defaults
  BEFORE INSERT OR UPDATE ON public.absences
  FOR EACH ROW
  EXECUTE FUNCTION public.absences_set_defaults_validate();
