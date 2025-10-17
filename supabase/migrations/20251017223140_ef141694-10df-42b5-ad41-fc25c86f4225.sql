-- Adicionar coluna shirt_size na tabela personnel
ALTER TABLE public.personnel
ADD COLUMN shirt_size TEXT;

-- Adicionar constraint para validar valores permitidos
ALTER TABLE public.personnel
ADD CONSTRAINT check_shirt_size 
CHECK (
  shirt_size IS NULL OR 
  shirt_size IN ('PP', 'P', 'M', 'G', 'GG', 'XG')
);

-- Adicionar comentário na coluna
COMMENT ON COLUMN public.personnel.shirt_size IS 'Tamanho da camisa do profissional (PP, P, M, G, GG, XG)';

-- Criar índice para consultas rápidas
CREATE INDEX idx_personnel_shirt_size ON public.personnel(shirt_size) WHERE shirt_size IS NOT NULL;