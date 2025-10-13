-- Reintroduzir coluna paid_by_id em payroll_closings, com RLS e trigger
SET search_path TO public;

-- 1) Adicionar coluna (permite NULL para compatibilidade com dados existentes)
ALTER TABLE public.payroll_closings
  ADD COLUMN IF NOT EXISTS paid_by_id UUID;

-- 2) Vincular a user_profiles(user_id) e indexar
ALTER TABLE public.payroll_closings
  ADD CONSTRAINT payroll_closings_paid_by_id_fkey
  FOREIGN KEY (paid_by_id)
  REFERENCES public.user_profiles(user_id)
  ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_payroll_closings_paid_by ON public.payroll_closings(paid_by_id);

-- 3) Trigger para preencher paid_by_id com o usuário atual quando não informado
CREATE OR REPLACE FUNCTION public.payroll_closings_set_paid_by()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NEW.paid_by_id IS NULL THEN
    NEW.paid_by_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS payroll_closings_set_paid_by_trg ON public.payroll_closings;
CREATE TRIGGER payroll_closings_set_paid_by_trg
BEFORE INSERT ON public.payroll_closings
FOR EACH ROW
EXECUTE FUNCTION public.payroll_closings_set_paid_by();

-- 4) Reforçar RLS de INSERT exigindo admin e paid_by_id = auth.uid()
DROP POLICY IF EXISTS "Admins da equipe podem inserir fechamentos" ON public.payroll_closings;
CREATE POLICY "Admins da equipe podem inserir fechamentos"
ON public.payroll_closings FOR INSERT
WITH CHECK (
  get_user_role_in_team(team_id) = 'admin' AND paid_by_id = auth.uid()
);