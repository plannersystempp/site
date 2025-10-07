-- Passo 1: Remover QUALQUER política de SELECT existente na tabela 'events' para evitar conflitos.
DROP POLICY IF EXISTS "Membros da equipe podem visualizar eventos OR super admin" ON public.events;
DROP POLICY IF EXISTS "Permitir acesso total para superadmin e acesso de equipe para outros" ON public.events;
DROP POLICY IF EXISTS "Membros da equipe podem visualizar eventos" ON public.events; -- Garantia extra

-- Passo 2: Criar a nova política de SELECT com a verificação correta e explícita.
-- Esta política verifica diretamente a tabela 'user_profiles'.
CREATE POLICY "Permitir acesso total para superadmin e acesso de equipe para outros"
ON public.events
FOR SELECT
USING (
  -- Condição 1 (Super Admin): Verifica se o ID do usuário logado tem a role 'superadmin' na tabela de perfis.
  (EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE user_profiles.user_id = auth.uid() AND user_profiles.role = 'superadmin'
  ))
  -- Condição 2 (Outros Usuários): OU usa a função helper existente para verificar se o usuário pertence à equipe do evento.
  OR
  (is_team_member(team_id))
);