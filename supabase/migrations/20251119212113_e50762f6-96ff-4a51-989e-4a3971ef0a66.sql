-- Adicionar campo para controlar acesso de coordenadores ao módulo de fornecedores
ALTER TABLE teams 
ADD COLUMN allow_coordinators_suppliers BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN teams.allow_coordinators_suppliers IS 'Permite que coordenadores acessem o módulo de fornecedores';