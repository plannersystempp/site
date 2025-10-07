-- Altera a restrição CHECK na coluna 'role' da tabela 'team_members'
-- para incluir o novo valor 'financeiro'.

-- 1. Primeiro, removemos a constraint antiga.
ALTER TABLE public.team_members
DROP CONSTRAINT IF EXISTS team_members_role_check;

-- 2. Em seguida, adicionamos a nova constraint com a lista de roles atualizada.
ALTER TABLE public.team_members
ADD CONSTRAINT team_members_role_check
CHECK (role IN ('admin', 'coordinator', 'financeiro'));

-- 3. Atualizar as políticas RLS para incluir a role 'financeiro'

-- Política para events
DROP POLICY IF EXISTS "events_team_access" ON public.events;
CREATE POLICY "events_team_access" ON public.events
FOR ALL
USING (
  team_id IN (
    SELECT teams.id FROM teams WHERE teams.owner_id = auth.uid()
  ) OR team_id IN (
    SELECT team_members.team_id FROM team_members 
    WHERE team_members.user_id = auth.uid() 
    AND team_members.status = 'approved'
    AND team_members.role IN ('admin', 'coordinator', 'financeiro')
  )
);

-- Política para personnel
DROP POLICY IF EXISTS "personnel_team_access" ON public.personnel;
CREATE POLICY "personnel_team_access" ON public.personnel
FOR ALL
USING (
  team_id IN (
    SELECT teams.id FROM teams WHERE teams.owner_id = auth.uid()
  ) OR team_id IN (
    SELECT team_members.team_id FROM team_members 
    WHERE team_members.user_id = auth.uid()
    AND team_members.status = 'approved'
    AND team_members.role IN ('admin', 'coordinator', 'financeiro')
  )
);

-- Política para personnel_allocations
DROP POLICY IF EXISTS "team_access_policy" ON public.personnel_allocations;
CREATE POLICY "team_access_policy" ON public.personnel_allocations
FOR ALL
USING (
  team_id IN (
    SELECT teams.id FROM teams WHERE teams.owner_id = auth.uid()
  ) OR team_id IN (
    SELECT team_members.team_id FROM team_members 
    WHERE team_members.user_id = auth.uid()
    AND team_members.status = 'approved'
    AND team_members.role IN ('admin', 'coordinator', 'financeiro')
  )
)
WITH CHECK (
  team_id IN (
    SELECT teams.id FROM teams WHERE teams.owner_id = auth.uid()
  ) OR team_id IN (
    SELECT team_members.team_id FROM team_members 
    WHERE team_members.user_id = auth.uid()
    AND team_members.status = 'approved'
    AND team_members.role IN ('admin', 'coordinator', 'financeiro')
  )
);

-- Política para work_records
DROP POLICY IF EXISTS "team_access_policy" ON public.work_records;
CREATE POLICY "team_access_policy" ON public.work_records
FOR ALL
USING (
  team_id IN (
    SELECT teams.id FROM teams WHERE teams.owner_id = auth.uid()
  ) OR team_id IN (
    SELECT team_members.team_id FROM team_members 
    WHERE team_members.user_id = auth.uid()
    AND team_members.status = 'approved'
    AND team_members.role IN ('admin', 'coordinator', 'financeiro')
  )
)
WITH CHECK (
  team_id IN (
    SELECT teams.id FROM teams WHERE teams.owner_id = auth.uid()
  ) OR team_id IN (
    SELECT team_members.team_id FROM team_members 
    WHERE team_members.user_id = auth.uid()
    AND team_members.status = 'approved'
    AND team_members.role IN ('admin', 'coordinator', 'financeiro')
  )
);

-- Política para payroll_closings
DROP POLICY IF EXISTS "team_access_policy" ON public.payroll_closings;
CREATE POLICY "team_access_policy" ON public.payroll_closings
FOR ALL
USING (
  team_id IN (
    SELECT teams.id FROM teams WHERE teams.owner_id = auth.uid()
  ) OR team_id IN (
    SELECT team_members.team_id FROM team_members 
    WHERE team_members.user_id = auth.uid()
    AND team_members.status = 'approved'
    AND team_members.role IN ('admin', 'coordinator', 'financeiro')
  )
)
WITH CHECK (
  team_id IN (
    SELECT teams.id FROM teams WHERE teams.owner_id = auth.uid()
  ) OR team_id IN (
    SELECT team_members.team_id FROM team_members 
    WHERE team_members.user_id = auth.uid()
    AND team_members.status = 'approved'
    AND team_members.role IN ('admin', 'coordinator', 'financeiro')
  )
);