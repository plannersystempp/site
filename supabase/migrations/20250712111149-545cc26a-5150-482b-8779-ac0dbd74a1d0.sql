-- Corrigir a função trigger que está causando o problema
CREATE OR REPLACE FUNCTION public.check_work_days_overlap()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Verificar se existe alguma alocação da mesma pessoa no mesmo evento
  -- com pelo menos um dia de trabalho em comum
  IF EXISTS (
    SELECT 1 
    FROM personnel_allocations 
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