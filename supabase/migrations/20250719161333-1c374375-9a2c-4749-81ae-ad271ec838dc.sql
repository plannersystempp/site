-- SCRIPT DE LIMPEZA DE COLUNAS OBSOLETAS
-- FASE 1: Remover políticas RLS que dependem das colunas user_id

-- Remover políticas que dependem de user_id
DROP POLICY IF EXISTS "Enable access for authenticated users only" ON public.event_divisions;
DROP POLICY IF EXISTS "Enable access for authenticated users only" ON public.personnel_allocations;
DROP POLICY IF EXISTS "Enable access for authenticated users only" ON public.work_records;
DROP POLICY IF EXISTS "Enable access for authenticated users only" ON public.payroll_closings;

-- FASE 2: Remover as colunas user_id e paid_by_id
ALTER TABLE public.events DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.personnel DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.functions DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.event_divisions DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.personnel_allocations DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.work_records DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.payroll_closings DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.payroll_closings DROP COLUMN IF EXISTS paid_by_id;

-- FASE 3: Criar novas políticas RLS baseadas em team_id
CREATE POLICY "team_access_policy" ON public.event_divisions
FOR ALL 
TO authenticated 
USING (
  team_id IN (
    SELECT teams.id FROM teams 
    WHERE teams.owner_id = auth.uid()
    UNION
    SELECT team_members.team_id FROM team_members 
    WHERE team_members.user_id = auth.uid() AND team_members.status = 'approved'
  )
)
WITH CHECK (
  team_id IN (
    SELECT teams.id FROM teams 
    WHERE teams.owner_id = auth.uid()
    UNION
    SELECT team_members.team_id FROM team_members 
    WHERE team_members.user_id = auth.uid() AND team_members.status = 'approved'
  )
);

CREATE POLICY "team_access_policy" ON public.personnel_allocations
FOR ALL 
TO authenticated 
USING (
  team_id IN (
    SELECT teams.id FROM teams 
    WHERE teams.owner_id = auth.uid()
    UNION
    SELECT team_members.team_id FROM team_members 
    WHERE team_members.user_id = auth.uid() AND team_members.status = 'approved'
  )
)
WITH CHECK (
  team_id IN (
    SELECT teams.id FROM teams 
    WHERE teams.owner_id = auth.uid()
    UNION
    SELECT team_members.team_id FROM team_members 
    WHERE team_members.user_id = auth.uid() AND team_members.status = 'approved'
  )
);

CREATE POLICY "team_access_policy" ON public.work_records
FOR ALL 
TO authenticated 
USING (
  team_id IN (
    SELECT teams.id FROM teams 
    WHERE teams.owner_id = auth.uid()
    UNION
    SELECT team_members.team_id FROM team_members 
    WHERE team_members.user_id = auth.uid() AND team_members.status = 'approved'
  )
)
WITH CHECK (
  team_id IN (
    SELECT teams.id FROM teams 
    WHERE teams.owner_id = auth.uid()
    UNION
    SELECT team_members.team_id FROM team_members 
    WHERE team_members.user_id = auth.uid() AND team_members.status = 'approved'
  )
);

CREATE POLICY "team_access_policy" ON public.payroll_closings
FOR ALL 
TO authenticated 
USING (
  team_id IN (
    SELECT teams.id FROM teams 
    WHERE teams.owner_id = auth.uid()
    UNION
    SELECT team_members.team_id FROM team_members 
    WHERE team_members.user_id = auth.uid() AND team_members.status = 'approved'
  )
)
WITH CHECK (
  team_id IN (
    SELECT teams.id FROM teams 
    WHERE teams.owner_id = auth.uid()
    UNION
    SELECT team_members.team_id FROM team_members 
    WHERE team_members.user_id = auth.uid() AND team_members.status = 'approved'
  )
);