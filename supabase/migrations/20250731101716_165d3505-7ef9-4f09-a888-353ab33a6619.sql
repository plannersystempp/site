-- Verificando qual tabela ainda precisa de política RLS
-- Baseado no linter, deve ser a tabela logs_checklist

-- Tabela: logs_checklist (se existir)
CREATE POLICY "Admins podem visualizar todos os logs de checklist"
ON public.logs_checklist FOR SELECT
USING ( is_admin() );

CREATE POLICY "Usuários podem inserir logs de checklist"
ON public.logs_checklist FOR INSERT
WITH CHECK ( auth.uid() IS NOT NULL );