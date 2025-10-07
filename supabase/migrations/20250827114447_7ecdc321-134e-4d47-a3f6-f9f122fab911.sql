
-- v2.6 - Flexibilidade financeira, lembretes de pagamento e assiduidade

-- 1) Event-specific cache na alocação
ALTER TABLE public.personnel_allocations
ADD COLUMN IF NOT EXISTS event_specific_cache numeric;

COMMENT ON COLUMN public.personnel_allocations.event_specific_cache
IS 'Cachê customizado para esta alocação específica; se definido (> 0), sobrepõe o cachê padrão do profissional.';

-- 2) Data de vencimento de pagamento no evento
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS payment_due_date date;

COMMENT ON COLUMN public.events.payment_due_date
IS 'Data limite para o pagamento da folha do evento.';

-- 3) Tabela de faltas
CREATE TABLE IF NOT EXISTS public.absences (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  team_id uuid NOT NULL,
  assignment_id uuid NOT NULL REFERENCES public.personnel_allocations(id) ON DELETE CASCADE,
  work_date date NOT NULL,
  logged_by_id uuid REFERENCES public.user_profiles(user_id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (assignment_id, work_date)
);

COMMENT ON TABLE public.absences IS 'Registra as faltas dos profissionais em dias de trabalho alocados.';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_absences_team_id ON public.absences(team_id);
CREATE INDEX IF NOT EXISTS idx_absences_assignment_id ON public.absences(assignment_id);
CREATE INDEX IF NOT EXISTS idx_absences_work_date ON public.absences(work_date);

-- RLS
ALTER TABLE public.absences ENABLE ROW LEVEL SECURITY;

-- Recria políticas para evitar duplicidade
DROP POLICY IF EXISTS "Absences select - team or superadmin" ON public.absences;
DROP POLICY IF EXISTS "Absences insert - team members" ON public.absences;
DROP POLICY IF EXISTS "Absences update - team members" ON public.absences;
DROP POLICY IF EXISTS "Absences delete - team members" ON public.absences;

CREATE POLICY "Absences select - team or superadmin"
ON public.absences FOR SELECT
USING (is_team_member(team_id) OR is_super_admin());

CREATE POLICY "Absences insert - team members"
ON public.absences FOR INSERT
WITH CHECK (is_team_member(team_id));

CREATE POLICY "Absences update - team members"
ON public.absences FOR UPDATE
USING (is_team_member(team_id))
WITH CHECK (is_team_member(team_id));

CREATE POLICY "Absences delete - team members"
ON public.absences FOR DELETE
USING (is_team_member(team_id));

-- Trigger: preenche team_id e logged_by_id e valida data contra work_days da alocação
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
  SELECT EXISTS (
    SELECT 1
    FROM public.personnel_allocations pa
    WHERE pa.id = NEW.assignment_id
      AND NEW.work_date = ANY(pa.work_days)
  ) INTO v_valid_date;

  IF NOT v_valid_date THEN
    RAISE EXCEPTION 'A data informada (%), não pertence aos dias de trabalho desta alocação', NEW.work_date;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS set_absences_defaults ON public.absences;
CREATE TRIGGER set_absences_defaults
BEFORE INSERT OR UPDATE ON public.absences
FOR EACH ROW
EXECUTE FUNCTION public.absences_set_defaults_validate();

-- Auditoria para faltas
DROP TRIGGER IF EXISTS absences_audit ON public.absences;
CREATE TRIGGER absences_audit
AFTER INSERT OR UPDATE OR DELETE ON public.absences
FOR EACH ROW
EXECUTE FUNCTION public.enhanced_audit_log();

-- 4) Atualiza a função de validação para cobrir event_specific_cache >= 0
CREATE OR REPLACE FUNCTION public.validate_business_rules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
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

    IF NEW.event_specific_cache IS NOT NULL AND NEW.event_specific_cache < 0 THEN
      RAISE EXCEPTION 'Event-specific cache cannot be negative';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Observação: já existem triggers que chamam validate_business_rules para events/work_records/personnel_allocations
-- Se algum estiver faltando, pode-se adicionar aqui (idempotente):
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'validate_events'
  ) THEN
    CREATE TRIGGER validate_events
    BEFORE INSERT OR UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.validate_business_rules();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'validate_work_records'
  ) THEN
    CREATE TRIGGER validate_work_records
    BEFORE INSERT OR UPDATE ON public.work_records
    FOR EACH ROW EXECUTE FUNCTION public.validate_business_rules();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'validate_personnel_allocations'
  ) THEN
    CREATE TRIGGER validate_personnel_allocations
    BEFORE INSERT OR UPDATE ON public.personnel_allocations
    FOR EACH ROW EXECUTE FUNCTION public.validate_business_rules();
  END IF;
END$$;
