-- ============================================================================
-- FASE 1: SISTEMA DE ASSINATURAS - ESTRUTURA BASE
-- ============================================================================

-- 1.1. Criar tabela de planos de assinatura
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  features JSONB DEFAULT '[]'::jsonb,
  limits JSONB NOT NULL DEFAULT '{
    "max_team_members": null,
    "max_events_per_month": null,
    "max_personnel": null
  }'::jsonb,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 1.2. Criar tabela de assinaturas das equipes
CREATE TABLE IF NOT EXISTS public.team_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'past_due', 'canceled', 'trial_expired')),
  trial_ends_at TIMESTAMPTZ,
  current_period_starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_ends_at TIMESTAMPTZ NOT NULL,
  canceled_at TIMESTAMPTZ,
  gateway_subscription_id TEXT,
  gateway_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id)
);

-- 1.3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_team_subscriptions_team_id ON public.team_subscriptions(team_id);
CREATE INDEX IF NOT EXISTS idx_team_subscriptions_status ON public.team_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_team_subscriptions_trial_ends_at ON public.team_subscriptions(trial_ends_at) WHERE status = 'trial';
CREATE INDEX IF NOT EXISTS idx_team_subscriptions_period_ends_at ON public.team_subscriptions(current_period_ends_at) WHERE status = 'active';

-- 1.4. Seed de planos de assinatura
INSERT INTO public.subscription_plans (name, display_name, description, price, billing_cycle, limits, sort_order) VALUES
('trial', 'Trial Gratuito', 'Teste gratuito por 15 dias com funcionalidades completas', 0, 'monthly', '{
  "max_team_members": 5,
  "max_events_per_month": 5,
  "max_personnel": 20
}'::jsonb, 1),
('basic', 'Plano Básico', 'Ideal para pequenas equipes e eventos ocasionais', 49.90, 'monthly', '{
  "max_team_members": 10,
  "max_events_per_month": 20,
  "max_personnel": 100
}'::jsonb, 2),
('professional', 'Plano Profissional', 'Para equipes em crescimento com eventos frequentes', 129.90, 'monthly', '{
  "max_team_members": 30,
  "max_events_per_month": null,
  "max_personnel": 500
}'::jsonb, 3),
('enterprise', 'Plano Enterprise', 'Recursos ilimitados para grandes operações', 499.90, 'monthly', '{
  "max_team_members": null,
  "max_events_per_month": null,
  "max_personnel": null
}'::jsonb, 4)
ON CONFLICT (name) DO NOTHING;

-- 1.5. Função para criar assinatura trial automaticamente
CREATE OR REPLACE FUNCTION public.create_trial_subscription_for_team()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_trial_plan_id UUID;
BEGIN
  -- Buscar o ID do plano trial
  SELECT id INTO v_trial_plan_id
  FROM public.subscription_plans
  WHERE name = 'trial'
  LIMIT 1;
  
  -- Criar assinatura trial de 15 dias
  INSERT INTO public.team_subscriptions (
    team_id,
    plan_id,
    status,
    trial_ends_at,
    current_period_starts_at,
    current_period_ends_at
  ) VALUES (
    NEW.id,
    v_trial_plan_id,
    'trial',
    now() + INTERVAL '15 days',
    now(),
    now() + INTERVAL '15 days'
  );
  
  -- Registrar no audit log
  INSERT INTO public.audit_logs (
    user_id,
    team_id,
    action,
    table_name,
    record_id,
    new_values
  ) VALUES (
    NEW.owner_id,
    NEW.id,
    'SUBSCRIPTION_CREATED',
    'team_subscriptions',
    NEW.id::TEXT,
    jsonb_build_object(
      'plan', 'trial',
      'trial_days', 15
    )
  );
  
  RETURN NEW;
END;
$$;

-- 1.6. Trigger para criar assinatura ao criar team
DROP TRIGGER IF EXISTS trigger_create_trial_subscription ON public.teams;
CREATE TRIGGER trigger_create_trial_subscription
  AFTER INSERT ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.create_trial_subscription_for_team();

-- 1.7. RLS Policies para subscription_plans
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem visualizar planos ativos"
ON public.subscription_plans FOR SELECT
USING (is_active = true);

CREATE POLICY "Apenas superadmin pode modificar planos"
ON public.subscription_plans FOR ALL
USING (is_super_admin());

-- 1.8. RLS Policies para team_subscriptions
ALTER TABLE public.team_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmin pode visualizar todas assinaturas"
ON public.team_subscriptions FOR SELECT
USING (is_super_admin());

CREATE POLICY "Admin da equipe pode visualizar sua assinatura"
ON public.team_subscriptions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = team_subscriptions.team_id
    AND tm.user_id = auth.uid()
    AND tm.role = 'admin'
    AND tm.status = 'approved'
  )
);

CREATE POLICY "Apenas superadmin pode modificar assinaturas"
ON public.team_subscriptions FOR ALL
USING (is_super_admin());

-- 1.9. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_subscription_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_subscription_updated_at ON public.team_subscriptions;
CREATE TRIGGER trigger_update_subscription_updated_at
  BEFORE UPDATE ON public.team_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_subscription_updated_at();

-- 1.10. CRÍTICO: Criar assinaturas trial para equipes existentes
DO $$
DECLARE
  v_trial_plan_id UUID;
BEGIN
  -- Buscar o ID do plano trial
  SELECT id INTO v_trial_plan_id
  FROM public.subscription_plans
  WHERE name = 'trial'
  LIMIT 1;
  
  -- Criar assinaturas para equipes existentes que não têm assinatura
  INSERT INTO public.team_subscriptions (
    team_id,
    plan_id,
    status,
    trial_ends_at,
    current_period_starts_at,
    current_period_ends_at
  )
  SELECT 
    t.id,
    v_trial_plan_id,
    'trial',
    now() + INTERVAL '15 days',
    now(),
    now() + INTERVAL '15 days'
  FROM public.teams t
  WHERE NOT EXISTS (
    SELECT 1 FROM public.team_subscriptions ts WHERE ts.team_id = t.id
  );
END $$;