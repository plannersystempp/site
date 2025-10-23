-- Clean up existing duplicates (keep most recent per team)
WITH ranked_personnel AS (
  SELECT 
    id,
    cpf,
    team_id,
    ROW_NUMBER() OVER (
      PARTITION BY team_id, LOWER(TRIM(REGEXP_REPLACE(cpf, '[^0-9]', '', 'g')))
      ORDER BY created_at DESC
    ) as rn
  FROM personnel
  WHERE cpf IS NOT NULL 
    AND TRIM(cpf) != ''
)
DELETE FROM personnel
WHERE id IN (
  SELECT id FROM ranked_personnel WHERE rn > 1
);

-- Add unique constraint for CPF (ignores formatting, only for non-null values)
CREATE UNIQUE INDEX idx_personnel_cpf_unique 
ON personnel (team_id, REGEXP_REPLACE(LOWER(TRIM(cpf)), '[^0-9]', '', 'g'))
WHERE cpf IS NOT NULL AND TRIM(cpf) != '';

COMMENT ON INDEX idx_personnel_cpf_unique IS 
'Ensures CPF is unique per team (ignores formatting)';

-- Add unique constraint for CNPJ (if provided)
CREATE UNIQUE INDEX idx_personnel_cnpj_unique 
ON personnel (team_id, REGEXP_REPLACE(LOWER(TRIM(cnpj)), '[^0-9]', '', 'g'))
WHERE cnpj IS NOT NULL AND TRIM(cnpj) != '';

COMMENT ON INDEX idx_personnel_cnpj_unique IS 
'Ensures CNPJ is unique per team (ignores formatting)';