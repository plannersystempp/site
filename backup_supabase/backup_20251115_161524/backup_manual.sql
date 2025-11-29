# Script de Backup Manual do Banco de Dados Supabase
# Este script deve ser executado manualmente no Supabase Dashboard ou pgAdmin
# Projeto: PlannerSystem (atogozlqfwxztjyycjoy)

# =====================================================
# INSTRUÇÕES DE USO
# =====================================================
# 1. Acesse o Supabase Dashboard: https://supabase.com/dashboard/project/atogozlqfwxztjyycjoy
# 2. Vá para SQL Editor
# 3. Copie e cole cada comando SQL abaixo
# 4. Execute individualmente ou em lotes
# 5. Salve os resultados em arquivos .csv ou .sql

# =====================================================
# 1. VERIFICAR CONEXÃO E STATUS
# =====================================================

# Verificar conexão e versão do PostgreSQL
SELECT version();

# Verificar tamanho do banco de dados
SELECT pg_size_pretty(pg_database_size(current_database())) as database_size;

# Listar todos os schemas
SELECT schema_name FROM information_schema.schemata ORDER BY schema_name;

# =====================================================
# 2. LISTAR TODAS AS TABELAS
# =====================================================

# Listar todas as tabelas do schema public
SELECT 
    table_name,
    table_type,
    (SELECT COUNT(*) FROM information_schema.tables t2 WHERE t2.table_name = t.table_name) as row_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

# =====================================================
# 3. CONTAGEM DE REGISTROS POR TABELA
# =====================================================

-- Contar registros em cada tabela principal
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

# =====================================================
# 4. EXPORTAR DADOS DAS TABELAS PRINCIPAIS
# =====================================================

# NOTA: Estes comandos devem ser executados no SQL Editor do Supabase
# Os arquivos serão salvos no servidor ou você pode copiar os resultados

# Exportar USERS (dados sensíveis - cuidado!)
-- COPY (SELECT id, email, role, created_at, updated_at FROM public.users) TO '/tmp/users_backup.csv' CSV HEADER;

# Exportar TEAMS
-- COPY (SELECT * FROM public.teams) TO '/tmp/teams_backup.csv' CSV HEADER;

# Exportar TEAM_MEMBERS
-- COPY (SELECT * FROM public.team_members) TO '/tmp/team_members_backup.csv' CSV HEADER;

# Exportar SUBSCRIPTIONS
-- COPY (SELECT * FROM public.subscriptions) TO '/tmp/subscriptions_backup.csv' CSV HEADER;

# Exportar PERSONNEL
-- COPY (SELECT * FROM public.personnel) TO '/tmp/personnel_backup.csv' CSV HEADER;

# Exportar EVENTS
-- COPY (SELECT * FROM public.events) TO '/tmp/events_backup.csv' CSV HEADER;

# Exportar EVENT_PERSONNEL
-- COPY (SELECT * FROM public.event_personnel) TO '/tmp/event_personnel_backup.csv' CSV HEADER;

# Exportar PAYROLL_CLOSINGS
-- COPY (SELECT * FROM public.payroll_closings) TO '/tmp/payroll_closings_backup.csv' CSV HEADER;

# Exportar NOTIFICATIONS
-- COPY (SELECT * FROM public.notifications) TO '/tmp/notifications_backup.csv' CSV HEADER;

# Exportar AUDIT_LOGS
-- COPY (SELECT * FROM public.audit_logs) TO '/tmp/audit_logs_backup.csv' CSV HEADER;

# =====================================================
# 5. BACKUP DA ESTRUTURA (DDL)
# =====================================================

# Gerar DDL para criar tabelas
SELECT 
    'CREATE TABLE IF NOT EXISTS public.' || table_name || ' (' ||
    string_agg(column_name || ' ' || data_type || 
               CASE WHEN character_maximum_length IS NOT NULL THEN '(' || character_maximum_length || ')'
                    WHEN numeric_precision IS NOT NULL AND numeric_scale IS NOT NULL THEN '(' || numeric_precision || ',' || numeric_scale || ')'
                    WHEN numeric_precision IS NOT NULL THEN '(' || numeric_precision || ')'
                    ELSE '' END ||
               CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END,
               ', ' ORDER BY ordinal_position) ||
    ');' as create_table_sql
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'teams', 'team_members', 'subscriptions', 'personnel', 'events', 'event_personnel', 'payroll_closings', 'notifications', 'audit_logs')
GROUP BY table_name
ORDER BY table_name;

# =====================================================
# 6. BACKUP DAS MIGRAÇÕES
# =====================================================

# Listar todas as migrações aplicadas
SELECT 
    version,
    name,
    applied_at
FROM supabase_migrations.schema_migrations
ORDER BY applied_at DESC;

# =====================================================
# 7. BACKUP DAS POLÍTICAS RLS
# =====================================================

# Listar políticas de segurança (RLS)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

# =====================================================
# 8. FUNÇÕES E TRIGGERS
# =====================================================

# Listar funções
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

# Listar triggers
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'public'
ORDER BY event_object_table, trigger_name;

# =====================================================
# 9. PERMISSÕES
# =====================================================

# Verificar permissões das tabelas
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public'
  AND grantee IN ('anon', 'authenticated', 'service_role')
ORDER BY table_name, grantee;