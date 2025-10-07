
-- Garantir extensão para UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Criar tabela absences caso não exista, com tipos esperados
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'absences'
  ) THEN
    CREATE TABLE public.absences (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      assignment_id UUID NOT NULL REFERENCES public.personnel_allocations(id) ON DELETE CASCADE,
      team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
      work_date DATE NOT NULL,
      notes TEXT,
      logged_by_id UUID, -- não cria FK para auth.users (conforme boas práticas)
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  END IF;
END $$;

-- 2) Se a tabela já existir com id bigint, converter para uuid com default
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'absences'
      AND column_name = 'id'
      AND data_type = 'bigint'
  ) THEN
    -- Remove identity (se houver), converte valor existente para novo uuid
    EXECUTE 'ALTER TABLE public.absences ALTER COLUMN id DROP IDENTITY IF EXISTS';
    EXECUTE 'ALTER TABLE public.absences ALTER COLUMN id TYPE uuid USING gen_random_uuid()';
    EXECUTE 'ALTER TABLE public.absences ALTER COLUMN id SET DEFAULT gen_random_uuid()';
  END IF;
END $$;

-- 3) Garantir unicidade: uma falta por assignment_id + work_date
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'absences_assignment_work_date_uniq'
  ) THEN
    ALTER TABLE public.absences
      ADD CONSTRAINT absences_assignment_work_date_uniq UNIQUE (assignment_id, work_date);
  END IF;
END $$;

-- 4) Função de trigger para setar defaults (logged_by_id = auth.uid() quando nulo)
CREATE OR REPLACE FUNCTION public.absences_set_defaults_validate()
RETURNS trigger
LANGUAGE plpgsql
AS $func$
BEGIN
  IF NEW.logged_by_id IS NULL THEN
    NEW.logged_by_id := auth.uid();
  END IF;

  IF NEW.created_at IS NULL THEN
    NEW.created_at := now();
  END IF;

  -- Opcional: validações simples
  IF NEW.work_date IS NULL THEN
    RAISE EXCEPTION 'work_date é obrigatório';
  END IF;

  RETURN NEW;
END;
$func$;

-- 5) Trigger BEFORE INSERT para aplicar a função acima
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_absences_set_defaults_validate'
  ) THEN
    CREATE TRIGGER trg_absences_set_defaults_validate
    BEFORE INSERT ON public.absences
    FOR EACH ROW
    EXECUTE FUNCTION public.absences_set_defaults_validate();
  END IF;
END $$;

-- 6) Habilitar RLS
ALTER TABLE public.absences ENABLE ROW LEVEL SECURITY;

-- 7) Políticas de RLS: apenas dono da equipe ou membro aprovado consegue ver/manipular
-- Regras auxiliares:
-- - Dono: teams.owner_id = auth.uid()
-- - Membro aprovado: team_members(user_id=auth.uid(), team_id=absences.team_id, status='approved')
-- - Usuário aprovado: user_profiles.is_approved = true

-- SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'absences' AND policyname = 'absences_select_team_members'
  ) THEN
    CREATE POLICY absences_select_team_members
    ON public.absences
    FOR SELECT
    USING (
      EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.user_id = auth.uid() AND up.is_approved = true)
      AND (
        EXISTS (SELECT 1 FROM public.teams t WHERE t.id = absences.team_id AND t.owner_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = absences.team_id AND tm.user_id = auth.uid() AND tm.status = 'approved')
      )
    );
  END IF;
END $$;

-- INSERT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'absences' AND policyname = 'absences_insert_team_members'
  ) THEN
    CREATE POLICY absences_insert_team_members
    ON public.absences
    FOR INSERT
    WITH CHECK (
      EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.user_id = auth.uid() AND up.is_approved = true)
      AND (
        EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.owner_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = team_id AND tm.user_id = auth.uid() AND tm.status = 'approved')
      )
    );
  END IF;
END $$;

-- UPDATE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'absences' AND policyname = 'absences_update_team_members'
  ) THEN
    CREATE POLICY absences_update_team_members
    ON public.absences
    FOR UPDATE
    USING (
      EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.user_id = auth.uid() AND up.is_approved = true)
      AND (
        EXISTS (SELECT 1 FROM public.teams t WHERE t.id = absences.team_id AND t.owner_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = absences.team_id AND tm.user_id = auth.uid() AND tm.status = 'approved')
      )
    )
    WITH CHECK (
      EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.user_id = auth.uid() AND up.is_approved = true)
      AND (
        EXISTS (SELECT 1 FROM public.teams t WHERE t.id = absences.team_id AND t.owner_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = absences.team_id AND tm.user_id = auth.uid() AND tm.status = 'approved')
      )
    );
  END IF;
END $$;

-- DELETE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'absences' AND policyname = 'absences_delete_team_members'
  ) THEN
    CREATE POLICY absences_delete_team_members
    ON public.absences
    FOR DELETE
    USING (
      EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.user_id = auth.uid() AND up.is_approved = true)
      AND (
        EXISTS (SELECT 1 FROM public.teams t WHERE t.id = absences.team_id AND t.owner_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = absences.team_id AND tm.user_id = auth.uid() AND tm.status = 'approved')
      )
    );
  END IF;
END $$;

-- 8) Índices úteis
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relname = 'idx_absences_team_id'
  ) THEN
    CREATE INDEX idx_absences_team_id ON public.absences(team_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relname = 'idx_absences_assignment_id'
  ) THEN
    CREATE INDEX idx_absences_assignment_id ON public.absences(assignment_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relname = 'idx_absences_work_date'
  ) THEN
    CREATE INDEX idx_absences_work_date ON public.absences(work_date);
  END IF;
END $$;
