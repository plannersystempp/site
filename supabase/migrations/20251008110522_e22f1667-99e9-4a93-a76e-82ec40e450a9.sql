-- =============================================
-- FASE 4: Configuração de Cron Jobs
-- Monitoramento automático diário de usuários órfãos
-- =============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Limpar cron jobs existentes com mesmo nome (se houver)
SELECT cron.unschedule('monitor-orphan-users-daily')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'monitor-orphan-users-daily'
);

-- Criar cron job para monitoramento diário às 9h
SELECT cron.schedule(
  'monitor-orphan-users-daily',
  '0 9 * * *', -- Todos os dias às 9h da manhã
  $$
  SELECT public.check_and_report_orphan_users();
  $$
);

-- Criar cron job para auto-correção diária às 3h (horário de baixo uso)
SELECT cron.schedule(
  'auto-fix-orphans-daily',
  '0 3 * * *', -- Todos os dias às 3h da manhã
  $$
  SELECT public.auto_fix_simple_orphans();
  $$
);

-- Log de configuração
DO $$
BEGIN
  RAISE NOTICE 'Cron jobs configurados com sucesso:';
  RAISE NOTICE '- monitor-orphan-users-daily: Executa às 9h diariamente';
  RAISE NOTICE '- auto-fix-orphans-daily: Executa às 3h diariamente';
END $$;