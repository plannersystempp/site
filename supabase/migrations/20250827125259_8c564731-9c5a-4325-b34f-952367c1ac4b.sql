-- Fix the absences trigger to handle proper data types and foreign keys
DROP TRIGGER IF EXISTS absences_set_defaults ON public.absences;

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
  -- Converte a data para texto para comparação correta com o array
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

-- Recriar o trigger
CREATE TRIGGER absences_set_defaults
  BEFORE INSERT ON public.absences
  FOR EACH ROW
  EXECUTE FUNCTION public.absences_set_defaults_validate();

-- Add unique constraint to prevent duplicate absences
ALTER TABLE public.absences 
ADD CONSTRAINT absences_assignment_date_unique 
UNIQUE (assignment_id, work_date);