-- Atualizar divisões existentes sem team_id
UPDATE event_divisions 
SET team_id = (
  SELECT e.team_id 
  FROM events e 
  WHERE e.id = event_divisions.event_id
) 
WHERE team_id IS NULL;