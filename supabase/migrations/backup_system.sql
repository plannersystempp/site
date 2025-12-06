-- Arquitetura de Backup: tabelas de configuração e logs
-- Idioma: pt-BR

-- Tabela de configurações de backup (apenas service role acessa diretamente)
CREATE TABLE IF NOT EXISTS public.backup_settings (
  id SERIAL PRIMARY KEY,
  retention_days INTEGER NOT NULL DEFAULT 30,
  max_backups INTEGER NOT NULL DEFAULT 20,
  format TEXT NOT NULL DEFAULT 'json' CHECK (format IN ('json','sql')),
  compression TEXT NOT NULL DEFAULT 'gzip' CHECK (compression IN ('none','gzip')),
  checksum_algorithm TEXT NOT NULL DEFAULT 'sha256' CHECK (checksum_algorithm IN ('sha256','md5')),
  created_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.backup_settings ENABLE ROW LEVEL SECURITY;

-- Políticas mínimas: bloquear acesso público; Edge Functions (service role) contornam RLS
DROP POLICY IF EXISTS backup_settings_allow_all ON public.backup_settings;

-- Tabela de logs de backup
CREATE TABLE IF NOT EXISTS public.backup_logs (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('running','success','failed')),
  file_key TEXT,
  file_name TEXT,
  file_size BIGINT,
  checksum TEXT,
  format TEXT CHECK (format IN ('json','sql')),
  compressed BOOLEAN DEFAULT TRUE,
  error TEXT,
  triggered_by UUID,
  retention_expires_at TIMESTAMPTZ,
  metadata JSONB
);

ALTER TABLE public.backup_logs ENABLE ROW LEVEL SECURITY;

-- Bloquear acesso público
DROP POLICY IF EXISTS backup_logs_allow_all ON public.backup_logs;

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_backup_logs_created_at ON public.backup_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backup_logs_status ON public.backup_logs(status);
CREATE INDEX IF NOT EXISTS idx_backup_logs_retention ON public.backup_logs(retention_expires_at);

-- Seed opcional de configuração padrão
INSERT INTO public.backup_settings (retention_days, max_backups, format, compression, checksum_algorithm)
SELECT 30, 20, 'json', 'gzip', 'sha256'
WHERE NOT EXISTS (SELECT 1 FROM public.backup_settings);

