-- Add setup period fields to events table
ALTER TABLE public.events
ADD COLUMN setup_start_date DATE,
ADD COLUMN setup_end_date DATE;

COMMENT ON COLUMN public.events.setup_start_date IS 'Data de início do período de montagem (opcional).';
COMMENT ON COLUMN public.events.setup_end_date IS 'Data de fim do período de montagem (opcional)';