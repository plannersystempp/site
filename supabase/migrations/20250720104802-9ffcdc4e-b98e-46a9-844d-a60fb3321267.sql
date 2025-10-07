-- TAREFA 1: ADICIONAR CÓDIGO DE CONVITE ÀS EQUIPES
-- Esta coluna armazenará um código único e fixo para cada equipe.
ALTER TABLE public.teams
ADD COLUMN invite_code TEXT UNIQUE;

-- Preenche o código para equipes existentes com um valor aleatório.
UPDATE public.teams
SET invite_code = substr(md5(random()::text), 0, 7)
WHERE invite_code IS NULL;

ALTER TABLE public.teams
ALTER COLUMN invite_code SET NOT NULL;

COMMENT ON COLUMN public.teams.invite_code IS 'Código de convite único para novos membros se juntarem à equipe.';

-- TAREFA 2: ATUALIZAR A TABELA DE MEMBROS
-- Adiciona uma coluna para rastrear com qual código o usuário se registrou.
ALTER TABLE public.team_members
ADD COLUMN joined_with_code TEXT;

COMMENT ON COLUMN public.team_members.joined_with_code IS 'Código de convite usado pelo usuário para solicitar acesso.';

-- TAREFA 3: ATUALIZAR OS STATUS DE EVENTOS
-- Adiciona o novo status para eventos com pagamentos pendentes.
ALTER TABLE public.events
ALTER COLUMN status SET DEFAULT 'planejado';

-- É necessário remover a constraint antiga para adicionar um novo valor ao CHECK
ALTER TABLE public.events
DROP CONSTRAINT IF EXISTS events_status_check;

ALTER TABLE public.events
ADD CONSTRAINT events_status_check
CHECK (status IN ('planejado', 'em_andamento', 'concluido', 'cancelado', 'concluido_pagamento_pendente'));

-- TAREFA 4: CRIAR TABELA PARA AVALIAÇÃO DE FREELANCERS
CREATE TABLE IF NOT EXISTS public.freelancer_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES public.personnel(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  rated_by_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.freelancer_ratings IS 'Armazena as avaliações de freelancers após cada evento.';

-- Habilitar RLS na nova tabela
ALTER TABLE public.freelancer_ratings ENABLE ROW LEVEL SECURITY;

-- Política de Acesso: Membros da equipe podem ver e criar avaliações.
CREATE POLICY "Team members can manage ratings"
ON public.freelancer_ratings FOR ALL
USING (team_id IN ( 
  SELECT teams.id
  FROM teams
  WHERE teams.owner_id = auth.uid()
UNION
  SELECT team_members.team_id
  FROM team_members
  WHERE team_members.user_id = auth.uid() AND team_members.status = 'approved'
))
WITH CHECK (team_id IN ( 
  SELECT teams.id
  FROM teams
  WHERE teams.owner_id = auth.uid()
UNION
  SELECT team_members.team_id
  FROM team_members
  WHERE team_members.user_id = auth.uid() AND team_members.status = 'approved'
));

-- TAREFA 5: FUNÇÃO PARA AUTOMAÇÃO DE STATUS DE EVENTOS
CREATE OR REPLACE FUNCTION public.update_event_statuses()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atualizar eventos que passaram da data de término
  UPDATE public.events 
  SET status = CASE
    WHEN EXISTS (
      SELECT 1 FROM public.personnel_allocations pa
      LEFT JOIN public.payroll_closings pc ON pc.event_id = pa.event_id AND pc.personnel_id = pa.personnel_id
      WHERE pa.event_id = events.id AND pc.id IS NULL
    ) THEN 'concluido_pagamento_pendente'
    ELSE 'concluido'
  END
  WHERE status IN ('planejado', 'em_andamento') 
  AND end_date < CURRENT_DATE;
END;
$$;