-- Migration para adicionar plano vitalício
-- Adiciona plano vitalício à tabela subscription_plans

-- Remover plano existente se houver
DELETE FROM subscription_plans WHERE name = 'lifetime';

-- Inserir o plano vitalício
INSERT INTO subscription_plans (
    name,
    display_name,
    description,
    price,
    billing_cycle,
    features,
    limits,
    is_active,
    is_popular,
    sort_order,
    created_at,
    updated_at
) VALUES (
    'lifetime',
    'Plano Vitalício',
    'Acesso vitalício completo à plataforma. Pagamento único, sem renovações.',
    99700, -- R$ 997,00 (preço sugerido para vitalício)
    'lifetime',
    '["Acesso vitalício à plataforma", "Todas as funcionalidades premium", "Suporte prioritário", "Atualizações gratuitas", "Sem taxas de renovação"]',
    '{"max_team_members": 100, "max_storage_gb": 100, "max_projects": -1, "max_api_calls": -1, "white_label": true, "advanced_analytics": true, "priority_support": true, "custom_integrations": true}',
    true,
    true,
    1, -- Primeiro na ordem de exibição
    NOW(),
    NOW()
);