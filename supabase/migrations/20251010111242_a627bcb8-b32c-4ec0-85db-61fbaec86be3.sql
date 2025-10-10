-- Remove individual overtime configuration from personnel table
-- Now using only global team configuration

ALTER TABLE personnel 
DROP COLUMN IF EXISTS overtime_threshold_hours,
DROP COLUMN IF EXISTS convert_overtime_to_daily;

-- Add comments to clarify team-level configuration
COMMENT ON COLUMN teams.default_overtime_threshold_hours IS 'Limiar de HE para toda a equipe (aplicado globalmente a todos os profissionais)';
COMMENT ON COLUMN teams.default_convert_overtime_to_daily IS 'Conversão de HE ativa para toda a equipe (aplicado globalmente a todos os profissionais)';