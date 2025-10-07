-- Primeiro, identificar e remover divisões duplicadas, mantendo apenas a mais antiga
WITH duplicates AS (
  SELECT id, event_id, name,
         ROW_NUMBER() OVER (PARTITION BY event_id, name ORDER BY created_at ASC) as rn
  FROM event_divisions
)
DELETE FROM event_divisions 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Agora adicionar a constraint de unicidade
ALTER TABLE public.event_divisions
ADD CONSTRAINT unique_division_name_per_event
UNIQUE (event_id, name);