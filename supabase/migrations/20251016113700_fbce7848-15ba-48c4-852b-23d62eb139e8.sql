-- ============================================================================
-- CORREÇÃO: HABILITAR RLS NAS NOVAS TABELAS
-- ============================================================================

-- Habilitar RLS na tabela team_usage
ALTER TABLE public.team_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies para team_usage
CREATE POLICY "Superadmin pode visualizar todo o uso"
ON public.team_usage FOR SELECT
USING (is_super_admin());

CREATE POLICY "Admin da equipe pode visualizar uso da sua equipe"
ON public.team_usage FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = team_usage.team_id
    AND tm.user_id = auth.uid()
    AND tm.role = 'admin'
    AND tm.status = 'approved'
  )
);

CREATE POLICY "Sistema pode atualizar team_usage"
ON public.team_usage FOR ALL
USING (true);