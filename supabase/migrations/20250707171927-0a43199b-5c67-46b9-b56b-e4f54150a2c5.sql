
-- Adicionar campo description na tabela events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS description text;

-- Corrigir status da tabela events para usar enum
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS status text DEFAULT 'planejado';

-- Garantir que todos os dados existentes tenham team_id preenchido para a equipe Laftech
UPDATE public.events 
SET team_id = '214aced5-254e-4dba-bfdb-86ceefb539ce' 
WHERE team_id IS NULL;

UPDATE public.personnel 
SET team_id = '214aced5-254e-4dba-bfdb-86ceefb539ce' 
WHERE team_id IS NULL;

UPDATE public.functions 
SET team_id = '214aced5-254e-4dba-bfdb-86ceefb539ce' 
WHERE team_id IS NULL;

UPDATE public.event_divisions 
SET team_id = '214aced5-254e-4dba-bfdb-86ceefb539ce' 
WHERE team_id IS NULL;

UPDATE public.personnel_allocations 
SET team_id = '214aced5-254e-4dba-bfdb-86ceefb539ce' 
WHERE team_id IS NULL;

UPDATE public.work_records 
SET team_id = '214aced5-254e-4dba-bfdb-86ceefb539ce' 
WHERE team_id IS NULL;

UPDATE public.payroll_closings 
SET team_id = '214aced5-254e-4dba-bfdb-86ceefb539ce' 
WHERE team_id IS NULL;
