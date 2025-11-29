-- Backup Completo do Banco de Dados - PlannerSystem
-- Data: 2025-11-15
-- Projeto: atogozlqfwxztjyycjoy
-- Diretório: backup_supabase\backup_20251115_161524

-- =====================================================
-- RESUMO DO BACKUP
-- =====================================================
-- Este script contém os comandos SQL para backup das tabelas principais
-- Execute cada comando individualmente para exportar os dados

-- =====================================================
-- 1. CONTAGEM DE REGISTROS POR TABELA
-- =====================================================

-- Users
SELECT 'users' as tabela, COUNT(*) as total_registros FROM public.users;

-- Teams
SELECT 'teams' as tabela, COUNT(*) as total_registros FROM public.teams;

-- Team Members
SELECT 'team_members' as tabela, COUNT(*) as total_registros FROM public.team_members;

-- Subscriptions
SELECT 'subscriptions' as tabela, COUNT(*) as total_registros FROM public.subscriptions;

-- Personnel
SELECT 'personnel' as tabela, COUNT(*) as total_registros FROM public.personnel;

-- Events
SELECT 'events' as tabela, COUNT(*) as total_registros FROM public.events;

-- Event Personnel
SELECT 'event_personnel' as tabela, COUNT(*) as total_registros FROM public.event_personnel;

-- Payroll Closings
SELECT 'payroll_closings' as tabela, COUNT(*) as total_registros FROM public.payroll_closings;

-- Notifications
SELECT 'notifications' as tabela, COUNT(*) as total_registros FROM public.notifications;

-- Audit Logs
SELECT 'audit_logs' as tabela, COUNT(*) as total_registros FROM public.audit_logs;

-- =====================================================
-- 2. COMANDOS DE EXPORTAÇÃO (COPY)
-- =====================================================
-- Descomente e execute os comandos abaixo para exportar os dados

-- Exportar Users
-- COPY (SELECT * FROM public.users) TO 'users_backup.csv' CSV HEADER;

-- Exportar Teams  
-- COPY (SELECT * FROM public.teams) TO 'teams_backup.csv' CSV HEADER;

-- Exportar Team Members
-- COPY (SELECT * FROM public.team_members) TO 'team_members_backup.csv' CSV HEADER;

-- Exportar Subscriptions
-- COPY (SELECT * FROM public.subscriptions) TO 'subscriptions_backup.csv' CSV HEADER;

-- Exportar Personnel
-- COPY (SELECT * FROM public.personnel) TO 'personnel_backup.csv' CSV HEADER;

-- Exportar Events
-- COPY (SELECT * FROM public.events) TO 'events_backup.csv' CSV HEADER;

-- Exportar Event Personnel
-- COPY (SELECT * FROM public.event_personnel) TO 'event_personnel_backup.csv' CSV HEADER;

-- Exportar Payroll Closings
-- COPY (SELECT * FROM public.payroll_closings) TO 'payroll_closings_backup.csv' CSV HEADER;

-- Exportar Notifications
-- COPY (SELECT * FROM public.notifications) TO 'notifications_backup.csv' CSV HEADER;

-- Exportar Audit Logs
-- COPY (SELECT * FROM public.audit_logs) TO 'audit_logs_backup.csv' CSV HEADER;

-- =====================================================
-- 3. ESTRUTURA DAS TABELAS (DDL)
-- =====================================================

-- Gerar DDL para cada tabela principal
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

-- =====================================================
-- 4. INDICES E CONSTRAINTS
-- =====================================================

-- Listar índices principais
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'teams', 'team_members', 'subscriptions', 'personnel', 'events', 'event_personnel', 'payroll_closings', 'notifications', 'audit_logs')
ORDER BY tablename, indexname;

-- =====================================================
-- 5. PERMISSÕES E RLS (Row Level Security)
-- =====================================================

-- Verificar políticas RLS
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
  AND tablename IN ('users', 'teams', 'team_members', 'subscriptions', 'personnel', 'events', 'event_personnel', 'payroll_closings', 'notifications', 'audit_logs')
ORDER BY tablename, policyname;

-- =====================================================
-- 6. FUNÇÕES E TRIGGERS
-- =====================================================

-- Listar funções do schema public
SELECT 
    routine_name,
    routine_type,
    data_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Listar triggers
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- 7. MIGRAÇÕES APLICADAS
-- =====================================================

-- Verificar histórico de migrações
SELECT 
    version,
    name,
    applied_at
FROM supabase_migrations.schema_migrations
ORDER BY applied_at DESC;