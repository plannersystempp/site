-- Políticas RLS para backup_logs permitindo leitura por superadmin
-- Idioma: pt-BR

-- Certificar que RLS está habilitado (já habilitado na migration anterior)
ALTER TABLE IF EXISTS public.backup_logs ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS read_for_superadmin ON public.backup_logs;

-- Política: permitir SELECT para usuários superadmin
CREATE POLICY read_for_superadmin ON public.backup_logs
  FOR SELECT
  USING (public.is_super_admin());

-- Opcionalmente, bloquear INSERT/UPDATE/DELETE para clientes
DROP POLICY IF EXISTS write_block_all ON public.backup_logs;
CREATE POLICY write_block_all ON public.backup_logs
  FOR ALL
  TO public
  USING (false)
  WITH CHECK (false);

