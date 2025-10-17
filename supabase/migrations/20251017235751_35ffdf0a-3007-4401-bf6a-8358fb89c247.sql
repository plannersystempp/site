-- FASE 4: Adicionar metadados ao plano trial e campo is_popular

-- Adicionar campo is_popular aos planos
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false;

-- Comentário na coluna
COMMENT ON COLUMN public.subscription_plans.is_popular IS 'Indica se o plano deve ser destacado como "Mais Popular" na página de planos';

-- Atualizar plano trial para garantir configuração correta
UPDATE public.subscription_plans
SET 
  is_active = true,
  price = 0,
  display_name = 'Trial Gratuito',
  description = '15 dias de acesso completo sem necessidade de cartão de crédito',
  is_popular = false
WHERE name = 'trial';

-- Exemplo: Marcar plano Pro como popular (ajustar conforme necessário)
-- Descomente a linha abaixo se quiser marcar um plano específico como popular
-- UPDATE public.subscription_plans SET is_popular = true WHERE name = 'pro';