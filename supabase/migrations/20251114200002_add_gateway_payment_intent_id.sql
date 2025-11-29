-- Adicionar coluna para armazenar o payment_intent_id do Stripe para planos lifetime
ALTER TABLE team_subscriptions 
ADD COLUMN IF NOT EXISTS gateway_payment_intent_id TEXT;

-- Adicionar comentário para documentar a nova coluna
COMMENT ON COLUMN team_subscriptions.gateway_payment_intent_id IS 'ID do Payment Intent do Stripe para pagamentos únicos (plano lifetime)';

-- Criar índice para melhorar performance em buscas
CREATE INDEX IF NOT EXISTS idx_team_subscriptions_gateway_payment_intent_id 
ON team_subscriptions(gateway_payment_intent_id);