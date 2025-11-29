-- Backup Completo - Informações do Banco de Dados
-- Executar através do Supabase Dashboard ou pgAdmin

-- 1. CONTAGEM DE REGISTROS POR TABELA PRINCIPAL
SELECT 'users' as tabela, COUNT(*) as total_registros FROM public.users
UNION ALL
SELECT 'teams' as tabela, COUNT(*) as total_registros FROM public.teams
UNION ALL
SELECT 'team_members' as tabela, COUNT(*) as total_registros FROM public.team_members
UNION ALL
SELECT 'subscriptions' as tabela, COUNT(*) as total_registros FROM public.subscriptions
UNION ALL
SELECT 'personnel' as tabela, COUNT(*) as total_registros FROM public.personnel
UNION ALL
SELECT 'events' as tabela, COUNT(*) as total_registros FROM public.events
UNION ALL
SELECT 'event_personnel' as tabela, COUNT(*) as total_registros FROM public.event_personnel
UNION ALL
SELECT 'payroll_closings' as tabela, COUNT(*) as total_registros FROM public.payroll_closings
UNION ALL
SELECT 'notifications' as tabela, COUNT(*) as total_registros FROM public.notifications
UNION ALL
SELECT 'audit_logs' as tabela, COUNT(*) as total_registros FROM public.audit_logs
ORDER BY tabela;

-- 2. TODAS AS TABELAS DO SCHEMA PUBLIC
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t.table_name) as registros
FROM information_schema.tables t
WHERE t.table_schema = 'public' 
  AND t.table_type = 'BASE TABLE'
ORDER BY table_name;

-- 3. MIGRAÇÕES APLICADAS (histórico)
SELECT version, name, applied_at
FROM supabase_migrations.schema_migrations
ORDER BY applied_at DESC
LIMIT 20;

-- 4. TAMANHO APROXIMADO DO BANCO
SELECT pg_size_pretty(pg_database_size(current_database())) as database_size;

-- 5. ESTRUTURA DAS TABELAS PRINCIPAIS (DDL resumido)
SELECT table_name, 
       string_agg(column_name || ': ' || data_type, ', ' ORDER BY ordinal_position) as colunas
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'teams', 'team_members', 'subscriptions', 'personnel', 'events', 'payroll_closings')
GROUP BY table_name
ORDER BY table_name;