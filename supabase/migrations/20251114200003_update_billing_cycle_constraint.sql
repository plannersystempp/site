-- Atualizar constraint do campo billing_cycle para incluir 'lifetime'
ALTER TABLE subscription_plans 
DROP CONSTRAINT IF EXISTS subscription_plans_billing_cycle_check;

ALTER TABLE subscription_plans 
ADD CONSTRAINT subscription_plans_billing_cycle_check 
CHECK (billing_cycle = ANY (ARRAY['monthly'::text, 'yearly'::text, 'lifetime'::text]));