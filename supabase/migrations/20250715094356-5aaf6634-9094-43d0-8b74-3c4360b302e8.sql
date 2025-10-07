-- TAREFA 1: ADICIONAR CAMPO CNPJ À TABELA DE EQUIPES
-- Adiciona a coluna para o CNPJ e garante que ele seja único no sistema.

ALTER TABLE public.teams
ADD COLUMN IF NOT EXISTS cnpj TEXT;

COMMENT ON COLUMN public.teams.cnpj IS 'CNPJ da empresa.';

-- Verifica se a constraint já existe antes de criar
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_cnpj' 
        AND table_name = 'teams'
    ) THEN
        ALTER TABLE public.teams ADD CONSTRAINT unique_cnpj UNIQUE (cnpj);
    END IF;
END $$;


-- TAREFA 2: ADICIONAR STATUS DE APROVAÇÃO AOS MEMBROS DA EQUIPE
-- Adiciona a coluna 'status' para controlar o acesso de novos membros.

ALTER TABLE public.team_members
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';

-- Adiciona a constraint CHECK se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'team_members_status_check'
    ) THEN
        ALTER TABLE public.team_members ADD CONSTRAINT team_members_status_check CHECK (status IN ('pending', 'approved', 'rejected'));
    END IF;
END $$;

COMMENT ON COLUMN public.team_members.status IS 'Status da solicitação do membro na equipe (pendente, aprovado, rejeitado).';