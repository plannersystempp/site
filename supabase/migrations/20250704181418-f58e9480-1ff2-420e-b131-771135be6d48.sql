
-- Criar tabela de equipes
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de membros da equipe
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'coordinator',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar índices para melhor performance
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE UNIQUE INDEX idx_team_members_unique ON public.team_members(team_id, user_id);

-- Habilitar RLS para ambas as tabelas
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para teams
CREATE POLICY "Users can view teams they belong to" ON public.teams
  FOR SELECT USING (
    id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can manage their teams" ON public.teams
  FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Users can create teams" ON public.teams
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Políticas RLS para team_members
CREATE POLICY "Users can view team members of their teams" ON public.team_members
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners and admins can manage team members" ON public.team_members
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

CREATE POLICY "Users can insert team members" ON public.team_members
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

-- Trigger para atualizar updated_at em teams
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
