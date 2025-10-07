
-- Add new optional columns to events for location and client contact phone
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS client_contact_phone text;

-- Optional descriptions (helpful for future maintainers)
COMMENT ON COLUMN public.events.location IS 'Local do evento (venue).';
COMMENT ON COLUMN public.events.client_contact_phone IS 'Número de telefone de contato do cliente para este evento.';
