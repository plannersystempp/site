-- ============================================================================
-- CONFIGURAÇÃO DO CRON JOB PARA VERIFICAÇÃO DE ASSINATURAS
-- ============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Agendar verificação diária de assinaturas às 00:01 UTC
SELECT cron.schedule(
  'check-subscriptions-daily',
  '1 0 * * *', -- Todo dia às 00:01
  $$
  SELECT
    net.http_post(
      url:='https://atogozlqfwxztjyycjoy.supabase.co/functions/v1/check-subscriptions',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0b2dvemxxZnd4enRqeXljam95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMDQ3MjksImV4cCI6MjA2NTY4MDcyOX0.m9c9XOJoU0RQeCentl1Ibow5yBqS6NfJVpxBaF75-ik"}'::jsonb,
      body:=concat('{"scheduled_at": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);