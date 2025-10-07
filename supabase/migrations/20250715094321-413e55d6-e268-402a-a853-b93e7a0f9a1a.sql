-- TAREFA 1: ADICIONAR CAMPO CNPJ À TABELA DE EQUIPES
-- Adiciona a coluna para o CNPJ e garante que ele seja único no sistema.

ALTER TABLE public.teams
ADD COLUMN IF NOT EXISTS cnpj TEXT;

COMMENT ON COLUMN public.teams.cnpj IS 'CNPJ da empresa.';

-- Adiciona a restrição de unicidade para a coluna CNPJ.
-- Isso é CRÍTICO para impedir que a mesma empresa seja cadastrada mais de uma vez.
ALTER TABLE public.teams
ADD CONSTRAINT IF NOT EXISTS unique_cnpj UNIQUE (cnpj);


-- TAREFA 2: ADICIONAR STATUS DE APROVAÇÃO AOS MEMBROS DA EQUIPE
-- Adiciona a coluna 'status' para controlar o acesso de novos membros.

ALTER TABLE public.team_members
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

COMMENT ON COLUMN public.team_members.status IS 'Status da solicitação do membro na equipe (pendente, aprovado, rejeitado).';