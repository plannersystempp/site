-- Adicionar campos do Stripe aos planos de assinatura
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS stripe_product_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

COMMENT ON COLUMN public.subscription_plans.stripe_product_id IS 'ID do produto no Stripe (prod_xxx)';
COMMENT ON COLUMN public.subscription_plans.stripe_price_id IS 'ID do preço no Stripe (price_xxx) para assinatura mensal';

-- Atualizar plano básico com IDs fornecidos para teste
UPDATE public.subscription_plans
SET 
  stripe_product_id = 'prod_TG3SXX8du4oS3D',
  stripe_price_id = 'price_1SJXLlDK41iGCsA8ezEs5Njh'
WHERE name = 'basic';

-- Criar índices para otimizar consultas relacionadas ao Stripe
CREATE INDEX IF NOT EXISTS idx_team_subscriptions_gateway_subscription_id 
ON public.team_subscriptions(gateway_subscription_id);

CREATE INDEX IF NOT EXISTS idx_team_subscriptions_gateway_customer_id 
ON public.team_subscriptions(gateway_customer_id);

CREATE INDEX IF NOT EXISTS idx_team_subscriptions_status 
ON public.team_subscriptions(status);