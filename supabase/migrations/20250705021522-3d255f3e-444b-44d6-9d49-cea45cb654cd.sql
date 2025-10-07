
-- Primeiro, vamos corrigir as políticas RLS para que funcionem corretamente
-- Remover políticas antigas que podem estar causando problemas
DROP POLICY IF EXISTS "Team members can view their teams" ON public.teams;
DROP POLICY IF EXISTS "Team owners can manage their teams" ON public.teams;
DROP POLICY IF EXISTS "Users can create teams" ON public.teams;

DROP POLICY IF EXISTS "Users can view team members of their teams" ON public.team_members;
DROP POLICY IF EXISTS "Team owners and admins can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can insert team members" ON public.team_members;

-- Criar novas políticas mais simples e funcionais para teams
CREATE POLICY "Users can view teams they belong to" ON public.teams
  FOR SELECT USING (
    id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid()
    ) OR owner_id = auth.uid()
  );

CREATE POLICY "Team owners can manage their teams" ON public.teams
  FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Users can create teams" ON public.teams
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Criar políticas para team_members
CREATE POLICY "Users can view team members of their teams" ON public.team_members
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid()
    ) OR team_id IN (
      SELECT id FROM public.teams WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can manage team members" ON public.team_members
  FOR ALL USING (
    team_id IN (
      SELECT id FROM public.teams WHERE owner_id = auth.uid()
    ) OR (
      team_id IN (
        SELECT team_id FROM public.team_members 
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    )
  );

CREATE POLICY "Users can join teams" ON public.team_members
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT id FROM public.teams WHERE owner_id = auth.uid()
    ) OR (
      team_id IN (
        SELECT team_id FROM public.team_members 
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Adicionar team_id às tabelas principais se ainda não existir
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'team_id') THEN
    ALTER TABLE public.events ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personnel' AND column_name = 'team_id') THEN
    ALTER TABLE public.personnel ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'functions' AND column_name = 'team_id') THEN
    ALTER TABLE public.functions ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Atualizar políticas das tabelas principais para usar team_id
DROP POLICY IF EXISTS "Enable access for authenticated users only" ON public.events;
CREATE POLICY "Team members can view events" ON public.events
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    ) OR team_id IN (
      SELECT id FROM public.teams WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can manage events" ON public.events
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT id FROM public.teams WHERE owner_id = auth.uid()
    ) OR team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Team admins can update events" ON public.events
  FOR UPDATE USING (
    team_id IN (
      SELECT id FROM public.teams WHERE owner_id = auth.uid()
    ) OR team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Team admins can delete events" ON public.events
  FOR DELETE USING (
    team_id IN (
      SELECT id FROM public.teams WHERE owner_id = auth.uid()
    ) OR team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Aplicar políticas similares para personnel
DROP POLICY IF EXISTS "Enable access for authenticated users only" ON public.personnel;
CREATE POLICY "Team members can view personnel" ON public.personnel
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    ) OR team_id IN (
      SELECT id FROM public.teams WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can manage personnel" ON public.personnel
  FOR ALL USING (
    team_id IN (
      SELECT id FROM public.teams WHERE owner_id = auth.uid()
    ) OR team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Aplicar políticas similares para functions
DROP POLICY IF EXISTS "Enable access for authenticated users only" ON public.functions;
CREATE POLICY "Team members can view functions" ON public.functions
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    ) OR team_id IN (
      SELECT id FROM public.teams WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can manage functions" ON public.functions
  FOR ALL USING (
    team_id IN (
      SELECT id FROM public.teams WHERE owner_id = auth.uid()
    ) OR team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
