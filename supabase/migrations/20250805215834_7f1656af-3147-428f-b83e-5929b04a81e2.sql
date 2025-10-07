
-- PASSO 1: CRIAR UMA NOVA TABELA DE LIGAÇÃO (JOIN TABLE)
-- Esta tabela irá conectar profissionais a múltiplas funções.
CREATE TABLE public.personnel_functions (
  personnel_id UUID NOT NULL REFERENCES public.personnel(id) ON DELETE CASCADE,
  function_id UUID NOT NULL REFERENCES public.functions(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (personnel_id, function_id)
);

-- Adiciona comentários para descrever a nova tabela
COMMENT ON TABLE public.personnel_functions IS 'Tabela de ligação para a relação muitos-para-muitos entre pessoal e funções.';

-- Habilita a segurança RLS na nova tabela
ALTER TABLE public.personnel_functions ENABLE ROW LEVEL SECURITY;

-- Cria a política de acesso: Membros da equipe podem gerenciar as associações de funções.
CREATE POLICY "Team members can manage personnel functions"
ON public.personnel_functions FOR ALL
USING ( is_team_member(team_id) );

-- PASSO 2: MIGRAR DADOS EXISTENTES PARA A NOVA TABELA
-- Inserir as associações existentes na nova tabela antes de remover a coluna
INSERT INTO public.personnel_functions (personnel_id, function_id, team_id)
SELECT id, function_id, team_id 
FROM public.personnel 
WHERE function_id IS NOT NULL;

-- PASSO 3: REMOVER A COLUNA ANTIGA DA TABELA 'personnel'
ALTER TABLE public.personnel
DROP COLUMN IF EXISTS function_id;
