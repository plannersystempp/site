-- Add overtime conversion configuration to teams table
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS default_overtime_threshold_hours NUMERIC DEFAULT 8,
ADD COLUMN IF NOT EXISTS default_convert_overtime_to_daily BOOLEAN DEFAULT false;

COMMENT ON COLUMN teams.default_overtime_threshold_hours IS 'Limiar de horas extras para converter em cachê diário (padrão da equipe)';
COMMENT ON COLUMN teams.default_convert_overtime_to_daily IS 'Se true, HE acima do limiar paga 1 cachê ao invés de valor/hora';

-- Add overtime conversion configuration to personnel table (for individual overrides)
ALTER TABLE public.personnel
ADD COLUMN IF NOT EXISTS overtime_threshold_hours NUMERIC DEFAULT NULL,
ADD COLUMN IF NOT EXISTS convert_overtime_to_daily BOOLEAN DEFAULT NULL;

COMMENT ON COLUMN personnel.overtime_threshold_hours IS 'Limiar individual de HE (null = usar padrão da equipe)';
COMMENT ON COLUMN personnel.convert_overtime_to_daily IS 'Config individual de conversão (null = usar padrão da equipe)';