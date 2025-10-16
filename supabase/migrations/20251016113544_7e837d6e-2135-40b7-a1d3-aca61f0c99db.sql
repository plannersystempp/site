-- ============================================================================
-- FASE 4: MIDDLEWARE DE LIMITES DE USO
-- ============================================================================

-- 4.1. Criar tabela de uso das equipes
CREATE TABLE IF NOT EXISTS public.team_usage (
  team_id UUID PRIMARY KEY REFERENCES public.teams(id) ON DELETE CASCADE,
  current_team_members INT DEFAULT 0,
  current_events_this_month INT DEFAULT 0,
  current_personnel INT DEFAULT 0,
  last_calculated_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4.2. Popular team_usage com dados atuais das equipes existentes
INSERT INTO public.team_usage (team_id, current_team_members, current_events_this_month, current_personnel)
SELECT 
  t.id,
  (SELECT COUNT(*) FROM public.team_members WHERE team_id = t.id AND status = 'approved'),
  (SELECT COUNT(*) FROM public.events WHERE team_id = t.id AND created_at >= date_trunc('month', CURRENT_DATE)),
  (SELECT COUNT(*) FROM public.personnel WHERE team_id = t.id)
FROM public.teams t
ON CONFLICT (team_id) DO NOTHING;

-- 4.3. Função para atualizar contadores de uso
CREATE OR REPLACE FUNCTION public.update_team_usage_counters()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Atualizar ou inserir contadores
  INSERT INTO public.team_usage (team_id, current_team_members, current_events_this_month, current_personnel)
  VALUES (
    COALESCE(NEW.team_id, OLD.team_id),
    0, 0, 0
  )
  ON CONFLICT (team_id) DO UPDATE SET
    current_team_members = (
      SELECT COUNT(*) FROM public.team_members 
      WHERE team_id = COALESCE(NEW.team_id, OLD.team_id) AND status = 'approved'
    ),
    current_events_this_month = (
      SELECT COUNT(*) FROM public.events 
      WHERE team_id = COALESCE(NEW.team_id, OLD.team_id) 
      AND created_at >= date_trunc('month', CURRENT_DATE)
    ),
    current_personnel = (
      SELECT COUNT(*) FROM public.personnel 
      WHERE team_id = COALESCE(NEW.team_id, OLD.team_id)
    ),
    updated_at = now();
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 4.4. Triggers para atualizar contadores automaticamente
DROP TRIGGER IF EXISTS trigger_update_team_usage_members ON public.team_members;
CREATE TRIGGER trigger_update_team_usage_members
  AFTER INSERT OR UPDATE OR DELETE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_team_usage_counters();

DROP TRIGGER IF EXISTS trigger_update_team_usage_events ON public.events;
CREATE TRIGGER trigger_update_team_usage_events
  AFTER INSERT OR DELETE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_team_usage_counters();

DROP TRIGGER IF EXISTS trigger_update_team_usage_personnel ON public.personnel;
CREATE TRIGGER trigger_update_team_usage_personnel
  AFTER INSERT OR DELETE ON public.personnel
  FOR EACH ROW
  EXECUTE FUNCTION public.update_team_usage_counters();

-- 4.5. Função para verificar limites de assinatura
CREATE OR REPLACE FUNCTION public.check_subscription_limits(
  p_team_id UUID,
  p_action TEXT -- 'add_member', 'create_event', 'add_personnel'
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_subscription RECORD;
  v_usage RECORD;
  v_plan_limits JSONB;
  v_can_proceed BOOLEAN := true;
  v_reason TEXT := '';
  v_current_count INT := 0;
  v_limit INT := NULL;
BEGIN
  -- Buscar assinatura ativa da equipe
  SELECT ts.*, sp.limits, sp.display_name as plan_name
  INTO v_subscription
  FROM public.team_subscriptions ts
  JOIN public.subscription_plans sp ON ts.plan_id = sp.id
  WHERE ts.team_id = p_team_id;
  
  -- Se não há assinatura, bloquear
  IF v_subscription IS NULL THEN
    RETURN jsonb_build_object(
      'can_proceed', false,
      'reason', 'Nenhuma assinatura ativa encontrada',
      'requires_upgrade', true
    );
  END IF;
  
  -- Se assinatura expirou, bloquear
  IF v_subscription.status IN ('trial_expired', 'canceled') THEN
    RETURN jsonb_build_object(
      'can_proceed', false,
      'reason', 'Assinatura expirada ou cancelada',
      'requires_upgrade', true,
      'current_plan', v_subscription.plan_name
    );
  END IF;
  
  -- Buscar uso atual
  SELECT * INTO v_usage
  FROM public.team_usage
  WHERE team_id = p_team_id;
  
  -- Se não há dados de uso, criar
  IF v_usage IS NULL THEN
    INSERT INTO public.team_usage (team_id, current_team_members, current_events_this_month, current_personnel)
    VALUES (p_team_id, 0, 0, 0)
    RETURNING * INTO v_usage;
  END IF;
  
  v_plan_limits := v_subscription.limits;
  
  -- Verificar limites baseado na ação
  CASE p_action
    WHEN 'add_member' THEN
      v_current_count := v_usage.current_team_members;
      v_limit := (v_plan_limits->>'max_team_members')::INT;
      
      IF v_limit IS NOT NULL AND v_current_count >= v_limit THEN
        v_can_proceed := false;
        v_reason := format('Limite de %s membros atingido no plano %s', v_limit, v_subscription.plan_name);
      END IF;
    
    WHEN 'create_event' THEN
      v_current_count := v_usage.current_events_this_month;
      v_limit := (v_plan_limits->>'max_events_per_month')::INT;
      
      IF v_limit IS NOT NULL AND v_current_count >= v_limit THEN
        v_can_proceed := false;
        v_reason := format('Limite de %s eventos por mês atingido no plano %s', v_limit, v_subscription.plan_name);
      END IF;
    
    WHEN 'add_personnel' THEN
      v_current_count := v_usage.current_personnel;
      v_limit := (v_plan_limits->>'max_personnel')::INT;
      
      IF v_limit IS NOT NULL AND v_current_count >= v_limit THEN
        v_can_proceed := false;
        v_reason := format('Limite de %s pessoas no cadastro atingido no plano %s', v_limit, v_subscription.plan_name);
      END IF;
    
    ELSE
      RETURN jsonb_build_object(
        'can_proceed', false,
        'reason', 'Ação inválida'
      );
  END CASE;
  
  -- Retornar resultado
  RETURN jsonb_build_object(
    'can_proceed', v_can_proceed,
    'reason', v_reason,
    'requires_upgrade', NOT v_can_proceed,
    'current_plan', v_subscription.plan_name,
    'current_count', v_current_count,
    'limit', v_limit,
    'usage_percentage', CASE 
      WHEN v_limit IS NULL THEN 0
      WHEN v_limit = 0 THEN 100
      ELSE ROUND((v_current_count::DECIMAL / v_limit::DECIMAL) * 100)
    END
  );
END;
$$;