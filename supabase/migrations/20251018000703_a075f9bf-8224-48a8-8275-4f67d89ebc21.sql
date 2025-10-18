-- Permitir acesso público aos planos (somente leitura)
DROP POLICY IF EXISTS "Planos são públicos para leitura" ON public.subscription_plans;

CREATE POLICY "Planos são públicos para leitura"
ON public.subscription_plans
FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Atualizar features dos planos com dados reais
UPDATE public.subscription_plans
SET features = '["Gerenciamento de eventos", "Gestão de pessoal básica", "Folha de pagamento simplificada", "Suporte por email"]'::jsonb
WHERE name = 'basic';

UPDATE public.subscription_plans
SET features = '["Todos os recursos do Básico", "Gerenciamento avançado de eventos", "Gestão completa de pessoal", "Folha de pagamento detalhada", "Avaliações de freelancers", "Histórico completo", "Suporte prioritário"]'::jsonb,
is_popular = true
WHERE name = 'professional';

UPDATE public.subscription_plans
SET features = '["Todos os recursos do Profissional", "Eventos ilimitados", "Pessoal ilimitado", "Membros ilimitados", "Relatórios avançados", "API de integração", "Suporte dedicado 24/7", "Customizações personalizadas"]'::jsonb
WHERE name = 'enterprise';

UPDATE public.subscription_plans
SET features = '["Acesso completo por 15 dias", "Até 5 eventos", "Até 20 pessoas", "Até 5 membros na equipe", "Teste todas as funcionalidades", "Sem necessidade de cartão"]'::jsonb
WHERE name = 'trial';