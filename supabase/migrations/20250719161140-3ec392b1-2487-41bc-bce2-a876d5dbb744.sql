-- SCRIPT DE LIMPEZA DE COLUNAS OBSOLETAS
-- AVISO: Esta ação é destrutiva e removerá as colunas permanentemente.

-- Remover colunas user_id das tabelas principais
ALTER TABLE public.events DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.personnel DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.functions DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.event_divisions DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.personnel_allocations DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.work_records DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.payroll_closings DROP COLUMN IF EXISTS user_id;

-- Remover colunas paid_by_id (relacionadas ao contexto de usuário)
ALTER TABLE public.payroll_closings DROP COLUMN IF EXISTS paid_by_id;