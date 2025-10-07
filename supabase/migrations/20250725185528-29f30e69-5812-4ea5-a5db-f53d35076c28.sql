-- Fix the remaining check_work_days_overlap function search path
CREATE OR REPLACE FUNCTION public.check_work_days_overlap()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $function$
BEGIN
  -- Verificar se existe alguma alocação da mesma pessoa no mesmo evento
  -- com pelo menos um dia de trabalho em comum
  IF EXISTS (
    SELECT 1 
    FROM public.personnel_allocations 
    WHERE personnel_id = NEW.personnel_id 
    AND event_id = NEW.event_id 
    AND id != COALESCE(NEW.id, gen_random_uuid())  -- Usa um UUID aleatório se NEW.id for NULL
    AND work_days && NEW.work_days  -- Operador de sobreposição de arrays
  ) THEN
    RAISE EXCEPTION 'Esta pessoa já está alocada neste evento para alguns dos dias selecionados.';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix validate_password function search path  
CREATE OR REPLACE FUNCTION public.validate_password(password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
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