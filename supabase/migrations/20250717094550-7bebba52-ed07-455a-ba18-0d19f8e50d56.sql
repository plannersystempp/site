-- Atualizar o status do admin para approved na equipe FREELAS
UPDATE public.team_members 
SET status = 'approved' 
WHERE user_id = 'fa84536a-b619-442e-a822-98a92740a2b6' 
AND team_id = '26d1b990-d395-4bdb-8918-6776dad005c0';