
-- Atualizar a tabela personnel para usar function_id em vez de function
ALTER TABLE personnel 
ADD COLUMN function_id UUID REFERENCES functions(id);

-- Remover a coluna function antiga (que era string)
ALTER TABLE personnel 
DROP COLUMN function;
