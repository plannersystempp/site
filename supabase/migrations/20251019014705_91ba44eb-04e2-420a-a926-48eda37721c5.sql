-- Adicionar coluna is_system à tabela teams para marcar times de sistema (ex.: PlannerSystem)
ALTER TABLE public.teams 
ADD COLUMN is_system BOOLEAN NOT NULL DEFAULT false;

-- Marcar o time PlannerSystem (SuperAdmin master) como time de sistema
UPDATE public.teams 
SET is_system = true 
WHERE id = '02b5053f-ecc2-41fe-ad0e-7ba2525661ff';

-- Criar índice parcial para melhorar performance de queries que filtram times não-sistema
CREATE INDEX idx_teams_not_system ON public.teams(id) WHERE is_system = false;

COMMENT ON COLUMN public.teams.is_system IS 'Indica se o time é de sistema (ex: time master do SuperAdmin) e deve ser excluído de listagens de assinaturas';