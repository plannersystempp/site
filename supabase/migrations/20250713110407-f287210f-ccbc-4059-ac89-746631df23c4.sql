-- Adiciona uma restrição de unicidade na tabela 'event_divisions'
-- Esta regra impede a criação de duas divisões com o mesmo nome DENTRO do mesmo evento.
ALTER TABLE public.event_divisions
ADD CONSTRAINT unique_division_name_per_event
UNIQUE (event_id, name);