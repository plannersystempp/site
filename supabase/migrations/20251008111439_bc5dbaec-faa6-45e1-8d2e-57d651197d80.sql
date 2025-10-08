-- PARTE 3 & 4: Criar tabela de logs de exclusão e RPC functions

-- Tabela para auditoria de exclusões (LGPD)
CREATE TABLE IF NOT EXISTS public.deletion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deleted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deletion_type TEXT NOT NULL, -- 'user_self', 'user_by_admin', 'team_by_admin'
  deleted_entity_id UUID NOT NULL,
  deleted_entity_type TEXT NOT NULL, -- 'user', 'team'
  deleted_entity_name TEXT,
  reason TEXT,
  data_summary JSONB, -- Resumo do que foi deletado
  deleted_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Apenas SuperAdmin pode ver
ALTER TABLE public.deletion_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only superadmin can view deletion logs"
ON public.deletion_logs FOR SELECT
USING (is_super_admin());

CREATE POLICY "System can insert deletion logs"
ON public.deletion_logs FOR INSERT
WITH CHECK (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_deletion_logs_deleted_by ON public.deletion_logs(deleted_by);
CREATE INDEX IF NOT EXISTS idx_deletion_logs_deleted_at ON public.deletion_logs(deleted_at DESC);
CREATE INDEX IF NOT EXISTS idx_deletion_logs_entity_type ON public.deletion_logs(deleted_entity_type);

-- PARTE 3: RPC Functions para estatísticas

-- Função para obter estatísticas de todas as equipes (SuperAdmin)
CREATE OR REPLACE FUNCTION public.get_team_stats_for_superadmin()
RETURNS TABLE (
  team_id UUID,
  team_name TEXT,
  team_cnpj TEXT,
  owner_id UUID,
  owner_name TEXT,
  owner_email TEXT,
  members_count BIGINT,
  events_count BIGINT,
  personnel_count BIGINT,
  created_at TIMESTAMPTZ
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    t.id,
    t.name,
    t.cnpj,
    t.owner_id,
    up.name,
    up.email,
    (SELECT COUNT(*) FROM team_members WHERE team_id = t.id AND status = 'approved'),
    (SELECT COUNT(*) FROM events WHERE team_id = t.id),
    (SELECT COUNT(*) FROM personnel WHERE team_id = t.id),
    t.created_at
  FROM teams t
  LEFT JOIN user_profiles up ON t.owner_id = up.user_id
  WHERE is_super_admin()
  ORDER BY t.created_at DESC;
$$;

-- Função para preview de exclusão de equipe
CREATE OR REPLACE FUNCTION public.preview_team_deletion(p_team_id UUID)
RETURNS JSONB
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'team_name', (SELECT name FROM teams WHERE id = p_team_id),
    'team_cnpj', (SELECT cnpj FROM teams WHERE id = p_team_id),
    'members_count', (SELECT COUNT(*) FROM team_members WHERE team_id = p_team_id),
    'events_count', (SELECT COUNT(*) FROM events WHERE team_id = p_team_id),
    'personnel_count', (SELECT COUNT(*) FROM personnel WHERE team_id = p_team_id),
    'work_records_count', (SELECT COUNT(*) FROM work_records WHERE team_id = p_team_id),
    'payroll_sheets_count', (SELECT COUNT(*) FROM payroll_sheets WHERE team_id = p_team_id),
    'functions_count', (SELECT COUNT(*) FROM functions WHERE team_id = p_team_id),
    'total_tables_affected', 15
  )
  WHERE is_super_admin();
$$;