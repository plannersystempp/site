
-- Corrigir as políticas RLS para as tabelas principais
-- Remover políticas antigas que podem estar causando problemas
DROP POLICY IF EXISTS "Team members can view events" ON public.events;
DROP POLICY IF EXISTS "Team admins can manage events" ON public.events;
DROP POLICY IF EXISTS "Team admins can update events" ON public.events;
DROP POLICY IF EXISTS "Team admins can delete events" ON public.events;
DROP POLICY IF EXISTS "Enable access for authenticated users only" ON public.events;

DROP POLICY IF EXISTS "Team members can view personnel" ON public.personnel;
DROP POLICY IF EXISTS "Team admins can manage personnel" ON public.personnel;
DROP POLICY IF EXISTS "Enable access for authenticated users only" ON public.personnel;

DROP POLICY IF EXISTS "Team members can view functions" ON public.functions;
DROP POLICY IF EXISTS "Team admins can manage functions" ON public.functions;
DROP POLICY IF EXISTS "Enable access for authenticated users only" ON public.functions;

-- Garantir que team_id existe em todas as tabelas necessárias
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE;
ALTER TABLE public.personnel ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE;
ALTER TABLE public.functions ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE;
ALTER TABLE public.event_divisions ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE;
ALTER TABLE public.personnel_allocations ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE;
ALTER TABLE public.work_records ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE;
ALTER TABLE public.payroll_closings ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE;

-- Criar uma equipe padrão para dados existentes se não houver equipes
INSERT INTO public.teams (name, owner_id)
SELECT 'Equipe Principal', auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE owner_id = auth.uid())
AND auth.uid() IS NOT NULL;

-- Adicionar o criador como admin da equipe
INSERT INTO public.team_members (team_id, user_id, role)
SELECT t.id, t.owner_id, 'admin'
FROM public.teams t
WHERE NOT EXISTS (
  SELECT 1 FROM public.team_members tm 
  WHERE tm.team_id = t.id AND tm.user_id = t.owner_id
);

-- Atualizar dados existentes para usar a primeira equipe do usuário
UPDATE public.events 
SET team_id = (
  SELECT t.id 
  FROM public.teams t 
  JOIN public.team_members tm ON tm.team_id = t.id 
  WHERE tm.user_id = events.user_id 
  LIMIT 1
)
WHERE team_id IS NULL;

UPDATE public.personnel 
SET team_id = (
  SELECT t.id 
  FROM public.teams t 
  JOIN public.team_members tm ON tm.team_id = t.id 
  WHERE tm.user_id = personnel.user_id 
  LIMIT 1
)
WHERE team_id IS NULL;

UPDATE public.functions 
SET team_id = (
  SELECT t.id 
  FROM public.teams t 
  JOIN public.team_members tm ON tm.team_id = t.id 
  WHERE tm.user_id = functions.user_id 
  LIMIT 1
)
WHERE team_id IS NULL;

-- Criar políticas RLS mais simples e funcionais
CREATE POLICY "Users can view events from their teams" ON public.events
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can manage events" ON public.events
  FOR ALL USING (
    team_id IN (
      SELECT tm.team_id FROM public.team_members tm
      WHERE tm.user_id = auth.uid() AND tm.role = 'admin'
    ) OR team_id IN (
      SELECT id FROM public.teams WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view personnel from their teams" ON public.personnel
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can manage personnel" ON public.personnel
  FOR ALL USING (
    team_id IN (
      SELECT tm.team_id FROM public.team_members tm
      WHERE tm.user_id = auth.uid() AND tm.role = 'admin'
    ) OR team_id IN (
      SELECT id FROM public.teams WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view functions from their teams" ON public.functions
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can manage functions" ON public.functions
  FOR ALL USING (
    team_id IN (
      SELECT tm.team_id FROM public.team_members tm
      WHERE tm.user_id = auth.uid() AND tm.role = 'admin'
    ) OR team_id IN (
      SELECT id FROM public.teams WHERE owner_id = auth.uid()
    )
  );

-- Corrigir políticas para team_members para permitir visualização
DROP POLICY IF EXISTS "Users can view team members of their teams" ON public.team_members;
CREATE POLICY "Users can view team members of their teams" ON public.team_members
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    ) OR team_id IN (
      SELECT id FROM public.teams WHERE owner_id = auth.uid()
    )
  );

-- Corrigir política de visualização de equipes
DROP POLICY IF EXISTS "Users can view teams they belong to" ON public.teams;
CREATE POLICY "Users can view teams they belong to" ON public.teams
  FOR SELECT USING (
    id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    ) OR owner_id = auth.uid()
  );
