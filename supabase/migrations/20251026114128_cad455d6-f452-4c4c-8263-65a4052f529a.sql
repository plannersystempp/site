-- ============================================
-- FASE 1: CRIAR TABELA DE PERMISSÕES
-- ============================================

-- Criar tabela de permissões granulares por evento
CREATE TABLE IF NOT EXISTS public.coordinator_event_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relacionamentos
  coordinator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  
  -- Flags de Permissão
  can_view_details BOOLEAN NOT NULL DEFAULT true,
  can_edit BOOLEAN NOT NULL DEFAULT false,
  can_manage_allocations BOOLEAN NOT NULL DEFAULT true,
  can_manage_costs BOOLEAN NOT NULL DEFAULT false,
  can_view_payroll BOOLEAN NOT NULL DEFAULT false,
  
  -- Auditoria
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  UNIQUE(coordinator_id, event_id),
  CHECK (can_view_details = true OR (can_edit = false AND can_manage_allocations = false AND can_manage_costs = false))
);

-- Índices para performance
CREATE INDEX idx_coordinator_permissions_coordinator ON public.coordinator_event_permissions(coordinator_id);
CREATE INDEX idx_coordinator_permissions_event ON public.coordinator_event_permissions(event_id);
CREATE INDEX idx_coordinator_permissions_team ON public.coordinator_event_permissions(team_id);

-- Trigger para updated_at
CREATE TRIGGER update_coordinator_permissions_updated_at
  BEFORE UPDATE ON public.coordinator_event_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CRIAR FUNÇÃO DE VALIDAÇÃO DE PERMISSÃO
-- ============================================

CREATE OR REPLACE FUNCTION public.has_event_permission(
  p_user_id UUID,
  p_event_id UUID,
  p_permission_type TEXT DEFAULT 'view'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_user_role TEXT;
  v_has_permission BOOLEAN := false;
BEGIN
  -- Superadmins sempre têm acesso
  IF EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = p_user_id 
    AND role = 'superadmin'
  ) THEN
    RETURN true;
  END IF;
  
  -- Buscar role na equipe do evento
  SELECT tm.role INTO v_user_role
  FROM public.team_members tm
  JOIN public.events e ON e.team_id = tm.team_id
  WHERE tm.user_id = p_user_id
    AND e.id = p_event_id
    AND tm.status = 'approved'
  LIMIT 1;
  
  -- Admins sempre têm acesso
  IF v_user_role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Coordenadores precisam de permissão explícita
  IF v_user_role = 'coordinator' THEN
    SELECT 
      CASE p_permission_type
        WHEN 'view' THEN cep.can_view_details
        WHEN 'edit' THEN cep.can_edit
        WHEN 'allocations' THEN cep.can_manage_allocations
        WHEN 'costs' THEN cep.can_manage_costs
        WHEN 'payroll' THEN cep.can_view_payroll
        ELSE false
      END INTO v_has_permission
    FROM public.coordinator_event_permissions cep
    WHERE cep.coordinator_id = p_user_id
      AND cep.event_id = p_event_id;
    
    RETURN COALESCE(v_has_permission, false);
  END IF;
  
  -- Outros roles não têm acesso
  RETURN false;
END;
$$;

-- ============================================
-- ATUALIZAR POLÍTICAS RLS
-- ============================================

-- RLS para coordinator_event_permissions
ALTER TABLE public.coordinator_event_permissions ENABLE ROW LEVEL SECURITY;

-- Admins podem gerenciar permissões de eventos
CREATE POLICY "Admins podem gerenciar permissões de eventos"
ON public.coordinator_event_permissions
FOR ALL
TO authenticated
USING (
  is_super_admin()
  OR
  get_user_role_in_team(team_id) = 'admin'
)
WITH CHECK (
  is_super_admin()
  OR
  get_user_role_in_team(team_id) = 'admin'
);

-- Coordenadores podem ver suas próprias permissões
CREATE POLICY "Coordenadores podem ver suas permissões"
ON public.coordinator_event_permissions
FOR SELECT
TO authenticated
USING (
  coordinator_id = auth.uid()
);

-- ============================================
-- ATUALIZAR RLS DE TABELAS DE DETALHES
-- ============================================

-- personnel_allocations: Coordenadores precisam de permissão
DROP POLICY IF EXISTS "Membros da equipe podem visualizar alocações OR super admin" ON public.personnel_allocations;

CREATE POLICY "Acesso granular a alocações"
ON public.personnel_allocations
FOR SELECT
TO authenticated
USING (
  is_super_admin()
  OR
  get_user_role_in_team(team_id) = 'admin'
  OR
  (
    get_user_role_in_team(team_id) = 'coordinator'
    AND has_event_permission(auth.uid(), event_id, 'view')
  )
);

DROP POLICY IF EXISTS "Membros da equipe podem atualizar alocações" ON public.personnel_allocations;

CREATE POLICY "Coordenadores podem editar alocações se autorizados"
ON public.personnel_allocations
FOR UPDATE
TO authenticated
USING (
  get_user_role_in_team(team_id) = 'admin'
  OR
  (
    get_user_role_in_team(team_id) = 'coordinator'
    AND has_event_permission(auth.uid(), event_id, 'allocations')
    AND has_event_permission(auth.uid(), event_id, 'edit')
  )
)
WITH CHECK (
  get_user_role_in_team(team_id) = 'admin'
  OR
  (
    get_user_role_in_team(team_id) = 'coordinator'
    AND has_event_permission(auth.uid(), event_id, 'allocations')
    AND has_event_permission(auth.uid(), event_id, 'edit')
  )
);

DROP POLICY IF EXISTS "Membros da equipe podem inserir alocações" ON public.personnel_allocations;

CREATE POLICY "Coordenadores podem inserir alocações se autorizados"
ON public.personnel_allocations
FOR INSERT
TO authenticated
WITH CHECK (
  get_user_role_in_team(team_id) = 'admin'
  OR
  (
    get_user_role_in_team(team_id) = 'coordinator'
    AND has_event_permission(auth.uid(), event_id, 'allocations')
    AND has_event_permission(auth.uid(), event_id, 'edit')
  )
);

DROP POLICY IF EXISTS "Membros da equipe podem deletar alocações" ON public.personnel_allocations;

CREATE POLICY "Coordenadores podem deletar alocações se autorizados"
ON public.personnel_allocations
FOR DELETE
TO authenticated
USING (
  get_user_role_in_team(team_id) = 'admin'
  OR
  (
    get_user_role_in_team(team_id) = 'coordinator'
    AND has_event_permission(auth.uid(), event_id, 'allocations')
    AND has_event_permission(auth.uid(), event_id, 'edit')
  )
);

-- event_divisions: Coordenadores precisam de permissão
DROP POLICY IF EXISTS "Membros da equipe podem visualizar as divisões do evento OR su" ON public.event_divisions;

CREATE POLICY "Acesso granular a divisões"
ON public.event_divisions
FOR SELECT
TO authenticated
USING (
  is_super_admin()
  OR
  get_user_role_in_team(team_id) = 'admin'
  OR
  (
    get_user_role_in_team(team_id) = 'coordinator'
    AND has_event_permission(auth.uid(), event_id, 'view')
  )
);

DROP POLICY IF EXISTS "Membros da equipe podem atualizar divisões do evento" ON public.event_divisions;

CREATE POLICY "Coordenadores podem editar divisões se autorizados"
ON public.event_divisions
FOR UPDATE
TO authenticated
USING (
  get_user_role_in_team(team_id) = 'admin'
  OR
  (
    get_user_role_in_team(team_id) = 'coordinator'
    AND has_event_permission(auth.uid(), event_id, 'edit')
  )
);

DROP POLICY IF EXISTS "Membros da equipe podem inserir divisões do evento" ON public.event_divisions;

CREATE POLICY "Coordenadores podem inserir divisões se autorizados"
ON public.event_divisions
FOR INSERT
TO authenticated
WITH CHECK (
  get_user_role_in_team(team_id) = 'admin'
  OR
  (
    get_user_role_in_team(team_id) = 'coordinator'
    AND has_event_permission(auth.uid(), event_id, 'edit')
  )
);

DROP POLICY IF EXISTS "Membros da equipe podem deletar divisões do evento" ON public.event_divisions;

CREATE POLICY "Coordenadores podem deletar divisões se autorizados"
ON public.event_divisions
FOR DELETE
TO authenticated
USING (
  get_user_role_in_team(team_id) = 'admin'
  OR
  (
    get_user_role_in_team(team_id) = 'coordinator'
    AND has_event_permission(auth.uid(), event_id, 'edit')
  )
);

-- event_supplier_costs: Requer can_manage_costs
DROP POLICY IF EXISTS "Team members can view supplier costs" ON public.event_supplier_costs;

CREATE POLICY "Acesso granular a custos"
ON public.event_supplier_costs
FOR SELECT
TO authenticated
USING (
  is_super_admin()
  OR
  (
    is_team_member(team_id) AND
    (
      get_user_role_in_team(team_id) = 'admin'
      OR
      (
        get_user_role_in_team(team_id) = 'coordinator'
        AND has_event_permission(auth.uid(), event_id, 'costs')
      )
    )
  )
);

DROP POLICY IF EXISTS "Team admins can manage supplier costs" ON public.event_supplier_costs;

CREATE POLICY "Coordenadores podem gerenciar custos se autorizados"
ON public.event_supplier_costs
FOR ALL
TO authenticated
USING (
  get_user_role_in_team(team_id) = 'admin'
  OR
  (
    get_user_role_in_team(team_id) = 'coordinator'
    AND has_event_permission(auth.uid(), event_id, 'costs')
    AND has_event_permission(auth.uid(), event_id, 'edit')
  )
);