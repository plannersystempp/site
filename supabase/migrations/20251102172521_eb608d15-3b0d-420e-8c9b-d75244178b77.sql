
-- Atualizar Plano Básico: max_personnel de 100 para 50
UPDATE subscription_plans
SET limits = jsonb_set(
  limits,
  '{max_personnel}',
  '50'
),
updated_at = now()
WHERE name = 'basic';

-- Atualizar Plano Profissional: max_personnel de 500 para 150
UPDATE subscription_plans
SET limits = jsonb_set(
  limits,
  '{max_personnel}',
  '150'
),
updated_at = now()
WHERE name = 'professional';
