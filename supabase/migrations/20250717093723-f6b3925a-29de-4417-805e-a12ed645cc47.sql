-- Deletar todos os registros relacionados à empresa Laftech
-- ID da empresa: 214aced5-254e-4dba-bfdb-86ceefb539ce

-- Deletar registros de payroll_closings
DELETE FROM public.payroll_closings WHERE team_id = '214aced5-254e-4dba-bfdb-86ceefb539ce';

-- Deletar registros de work_records
DELETE FROM public.work_records WHERE team_id = '214aced5-254e-4dba-bfdb-86ceefb539ce';

-- Deletar registros de personnel_allocations
DELETE FROM public.personnel_allocations WHERE team_id = '214aced5-254e-4dba-bfdb-86ceefb539ce';

-- Deletar registros de event_divisions
DELETE FROM public.event_divisions WHERE team_id = '214aced5-254e-4dba-bfdb-86ceefb539ce';

-- Deletar registros de personnel
DELETE FROM public.personnel WHERE team_id = '214aced5-254e-4dba-bfdb-86ceefb539ce';

-- Deletar registros de events
DELETE FROM public.events WHERE team_id = '214aced5-254e-4dba-bfdb-86ceefb539ce';

-- Deletar registros de functions
DELETE FROM public.functions WHERE team_id = '214aced5-254e-4dba-bfdb-86ceefb539ce';

-- Deletar membros da equipe
DELETE FROM public.team_members WHERE team_id = '214aced5-254e-4dba-bfdb-86ceefb539ce';

-- Deletar a empresa Laftech
DELETE FROM public.teams WHERE id = '214aced5-254e-4dba-bfdb-86ceefb539ce';