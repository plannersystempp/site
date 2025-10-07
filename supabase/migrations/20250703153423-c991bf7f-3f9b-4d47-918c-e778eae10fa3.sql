
-- 1. Criar tabela de equipes
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Criar tabela de membros da equipe
CREATE TABLE public.team_members (
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'coordinator')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    PRIMARY KEY (team_id, user_id)
);

-- 3. Habilitar RLS nas novas tabelas
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- 4. Criar funções auxiliares para verificação de permissões
CREATE OR REPLACE FUNCTION public.get_user_role_in_team(team_id UUID)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT role 
    FROM public.team_members 
    WHERE team_members.team_id = $1 
    AND team_members.user_id = auth.uid()
    LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_team_member(team_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.team_members 
        WHERE team_members.team_id = $1 
        AND team_members.user_id = auth.uid()
    );
$$;

-- 5. Políticas RLS para teams
CREATE POLICY "Team members can view their teams"
    ON public.teams FOR SELECT
    USING (public.is_team_member(id));

CREATE POLICY "Team owners can manage their teams"
    ON public.teams FOR ALL
    USING (owner_id = auth.uid());

-- 6. Políticas RLS para team_members
CREATE POLICY "Team members can view team membership"
    ON public.team_members FOR SELECT
    USING (public.is_team_member(team_id));

CREATE POLICY "Team admins can manage team membership"
    ON public.team_members FOR ALL
    USING (public.get_user_role_in_team(team_id) = 'admin');

-- 7. Migrar dados existentes - Adicionar coluna team_id nas tabelas
ALTER TABLE public.events ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE;
ALTER TABLE public.personnel ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE;
ALTER TABLE public.functions ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE;
ALTER TABLE public.event_divisions ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE;
ALTER TABLE public.personnel_allocations ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE;
ALTER TABLE public.work_records ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE;
ALTER TABLE public.payroll_closings ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE;
ALTER TABLE public.audit_logs ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE;

-- 8. Criar equipes para usuários existentes e migrar dados
INSERT INTO public.teams (name, owner_id)
SELECT DISTINCT 
    COALESCE(up.name, 'Equipe de ' || up.email) AS name,
    up.user_id
FROM public.user_profiles up
WHERE up.role IN ('admin', 'coordenador') OR up.user_id IN (
    SELECT DISTINCT user_id FROM public.events
    UNION
    SELECT DISTINCT user_id FROM public.personnel
    UNION
    SELECT DISTINCT user_id FROM public.functions
);

-- 9. Adicionar owners como admins de suas equipes
INSERT INTO public.team_members (team_id, user_id, role)
SELECT t.id, t.owner_id, 'admin'
FROM public.teams t;

-- 10. Migrar dados existentes para usar team_id
UPDATE public.events SET team_id = (
    SELECT t.id FROM public.teams t WHERE t.owner_id = events.user_id LIMIT 1
);

UPDATE public.personnel SET team_id = (
    SELECT t.id FROM public.teams t WHERE t.owner_id = personnel.user_id LIMIT 1
);

UPDATE public.functions SET team_id = (
    SELECT t.id FROM public.teams t WHERE t.owner_id = functions.user_id LIMIT 1
);

UPDATE public.event_divisions SET team_id = (
    SELECT t.id FROM public.teams t WHERE t.owner_id = event_divisions.user_id LIMIT 1
);

UPDATE public.personnel_allocations SET team_id = (
    SELECT t.id FROM public.teams t WHERE t.owner_id = personnel_allocations.user_id LIMIT 1
);

UPDATE public.work_records SET team_id = (
    SELECT t.id FROM public.teams t WHERE t.owner_id = work_records.user_id LIMIT 1
);

UPDATE public.payroll_closings SET team_id = (
    SELECT t.id FROM public.teams t WHERE t.owner_id = payroll_closings.user_id LIMIT 1
);

UPDATE public.audit_logs SET team_id = (
    SELECT t.id FROM public.teams t WHERE t.owner_id = audit_logs.user_id LIMIT 1
);

-- 11. Tornar team_id obrigatório após migração
ALTER TABLE public.events ALTER COLUMN team_id SET NOT NULL;
ALTER TABLE public.personnel ALTER COLUMN team_id SET NOT NULL;
ALTER TABLE public.functions ALTER COLUMN team_id SET NOT NULL;
ALTER TABLE public.event_divisions ALTER COLUMN team_id SET NOT NULL;
ALTER TABLE public.personnel_allocations ALTER COLUMN team_id SET NOT NULL;
ALTER TABLE public.work_records ALTER COLUMN team_id SET NOT NULL;
ALTER TABLE public.payroll_closings ALTER COLUMN team_id SET NOT NULL;

-- 12. Atualizar políticas RLS existentes para usar team_id
DROP POLICY IF EXISTS "Enable access for authenticated users only" ON public.events;
CREATE POLICY "Team members can view events"
    ON public.events FOR SELECT
    USING (public.is_team_member(team_id));
CREATE POLICY "Team admins can manage events"
    ON public.events FOR INSERT, UPDATE, DELETE
    USING (public.get_user_role_in_team(team_id) = 'admin');

DROP POLICY IF EXISTS "Enable access for authenticated users only" ON public.personnel;
CREATE POLICY "Team members can view personnel"
    ON public.personnel FOR SELECT
    USING (public.is_team_member(team_id));
CREATE POLICY "Team admins can manage personnel"
    ON public.personnel FOR INSERT, UPDATE, DELETE
    USING (public.get_user_role_in_team(team_id) = 'admin');

DROP POLICY IF EXISTS "Enable access for authenticated users only" ON public.functions;
CREATE POLICY "Team members can view functions"
    ON public.functions FOR SELECT
    USING (public.is_team_member(team_id));
CREATE POLICY "Team admins can manage functions"
    ON public.functions FOR INSERT, UPDATE, DELETE
    USING (public.get_user_role_in_team(team_id) = 'admin');

DROP POLICY IF EXISTS "Enable access for authenticated users only" ON public.event_divisions;
CREATE POLICY "Team members can view divisions"
    ON public.event_divisions FOR SELECT
    USING (public.is_team_member(team_id));
CREATE POLICY "Team admins can manage divisions"
    ON public.event_divisions FOR INSERT, UPDATE, DELETE
    USING (public.get_user_role_in_team(team_id) = 'admin');

DROP POLICY IF EXISTS "Enable access for authenticated users only" ON public.personnel_allocations;
CREATE POLICY "Team members can view allocations"
    ON public.personnel_allocations FOR SELECT
    USING (public.is_team_member(team_id));
CREATE POLICY "Team admins can manage allocations"
    ON public.personnel_allocations FOR INSERT, UPDATE, DELETE
    USING (public.get_user_role_in_team(team_id) = 'admin');

DROP POLICY IF EXISTS "Enable access for authenticated users only" ON public.work_records;
CREATE POLICY "Team members can view work records"
    ON public.work_records FOR SELECT
    USING (public.is_team_member(team_id));
CREATE POLICY "Team admins can manage work records"
    ON public.work_records FOR INSERT, UPDATE, DELETE
    USING (public.get_user_role_in_team(team_id) = 'admin');

DROP POLICY IF EXISTS "Enable access for authenticated users only" ON public.payroll_closings;
CREATE POLICY "Team members can view payroll closings"
    ON public.payroll_closings FOR SELECT
    USING (public.is_team_member(team_id));
CREATE POLICY "Team admins can manage payroll closings"
    ON public.payroll_closings FOR INSERT, UPDATE, DELETE
    USING (public.get_user_role_in_team(team_id) = 'admin');
