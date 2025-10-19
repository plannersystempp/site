-- Atualizar plano básico com IDs do Stripe
UPDATE public.subscription_plans
SET 
  stripe_product_id = 'prod_TG3SXX8du4oS3D',
  stripe_price_id = 'price_1SJXLlDK41iGCsA8ezEs5Njh',
  updated_at = now()
WHERE name = 'basic';

-- Criar índice para melhor performance nas consultas de assinatura
CREATE INDEX IF NOT EXISTS idx_team_subscriptions_team_status 
ON public.team_subscriptions(team_id, status);

-- Log da atualização
INSERT INTO public.audit_logs (
  action,
  table_name,
  record_id,
  new_values
) VALUES (
  'STRIPE_IDS_UPDATE',
  'subscription_plans',
  'basic',
  jsonb_build_object(
    'stripe_product_id', 'prod_TG3SXX8du4oS3D',
    'stripe_price_id', 'price_1SJXLlDK41iGCsA8ezEs5Njh'
  )
);