# 🎯 Integração Stripe - SIGE

## ✅ Status da Implementação

### Concluído:

1. **✅ Database Migration**
   - Campos `stripe_product_id` e `stripe_price_id` adicionados a `subscription_plans`
   - Plano básico configurado com IDs de teste
   - Índices criados para otimização

2. **✅ Edge Functions**
   - `create-checkout-session`: Cria sessão de checkout no Stripe
   - `verify-payment`: Verifica e ativa assinatura após pagamento
   - CORS configurado corretamente
   - Logs implementados para debug

3. **✅ Frontend**
   - Hook `useStripeCheckout`: Gerencia criação de checkout
   - Hook `useVerifyPayment`: Valida pagamento
   - Hook `useSubscriptionGuard`: Protege rotas baseado em assinatura
   - Página `PaymentSuccess`: Feedback pós-pagamento
   - `PlansPage` atualizada com redirecionamento ao Stripe

4. **✅ Configuração**
   - `config.toml` atualizado com edge functions
   - Rota `/payment-success` adicionada no App.tsx

---

## 📋 Próximos Passos

### 1. Configurar Secret STRIPE_SECRET_KEY
```
1. Acesse: https://supabase.com/dashboard/project/atogozlqfwxztjyycjoy/settings/functions
2. Adicione o secret: STRIPE_SECRET_KEY
3. Use sua chave de teste do Stripe: sk_test_...
```

### 2. Criar Produtos e Preços no Stripe

Acesse: https://dashboard.stripe.com/test/products

**Para cada plano (Básico, Profissional, Enterprise):**

1. Clique em "Adicionar produto"
2. Preencha:
   - Nome: "SIGE - Plano Básico" (ou outro)
   - Descrição
   - Preço: R$ 97,00/mês (ou valor desejado)
   - Recorrência: Mensal
3. Anote o `Product ID` (prod_xxx) e `Price ID` (price_xxx)

### 3. Atualizar IDs no Banco de Dados

Após criar os produtos no Stripe, atualize o banco:

```sql
-- Plano Básico
UPDATE subscription_plans
SET 
  stripe_product_id = 'prod_SEU_PRODUCT_ID',
  stripe_price_id = 'price_SEU_PRICE_ID'
WHERE name = 'basic';

-- Plano Profissional
UPDATE subscription_plans
SET 
  stripe_product_id = 'prod_SEU_PRODUCT_ID',
  stripe_price_id = 'price_SEU_PRICE_ID'
WHERE name = 'professional';

-- Plano Enterprise
UPDATE subscription_plans
SET 
  stripe_product_id = 'prod_SEU_PRODUCT_ID',
  stripe_price_id = 'price_SEU_PRICE_ID'
WHERE name = 'enterprise';
```

Execute no SQL Editor: https://supabase.com/dashboard/project/atogozlqfwxztjyycjoy/sql/new

---

## 🧪 Como Testar

### 1. Fluxo Completo de Pagamento

1. Faça login como **admin** de uma equipe
2. Acesse `/plans`
3. Clique em "Assinar Agora" em um plano pago
4. Confirme o redirecionamento
5. Use cartão de teste:
   - **Número**: 4242 4242 4242 4242
   - **CVC**: Qualquer 3 dígitos
   - **Data**: Qualquer data futura
6. Complete o pagamento
7. Verifique se é redirecionado para `/payment-success`
8. Aguarde a verificação automática
9. Clique em "Ir para o Dashboard"

### 2. Verificar Assinatura Ativada

Execute no SQL Editor:

```sql
SELECT 
  ts.*,
  sp.display_name,
  t.name as team_name
FROM team_subscriptions ts
JOIN subscription_plans sp ON ts.plan_id = sp.id
JOIN teams t ON ts.team_id = t.id
WHERE ts.status = 'active'
ORDER BY ts.created_at DESC;
```

### 3. Testar Falha de Pagamento

Use o cartão: `4000 0000 0000 0002`

---

## 🔍 Debug e Logs

### Ver logs das Edge Functions:

**create-checkout-session:**
https://supabase.com/dashboard/project/atogozlqfwxztjyycjoy/functions/create-checkout-session/logs

**verify-payment:**
https://supabase.com/dashboard/project/atogozlqfwxztjyycjoy/functions/verify-payment/logs

### Verificar eventos no Stripe:
https://dashboard.stripe.com/test/events

### Ver audit logs no banco:

```sql
SELECT * FROM audit_logs 
WHERE action IN ('CHECKOUT_SESSION_CREATED', 'SUBSCRIPTION_ACTIVATED')
ORDER BY created_at DESC
LIMIT 20;
```

---

## 🛡️ Segurança Implementada

✅ **Autenticação obrigatória**: Todas as edge functions verificam JWT
✅ **Validação de permissões**: Apenas owners/admins podem assinar planos
✅ **Idempotência**: Verificação de assinaturas existentes antes de criar
✅ **Audit trail**: Todas as ações são registradas em audit_logs
✅ **Validação de dados**: Planos e equipes são validados antes do checkout

---

## 📊 Arquitetura do Fluxo

```
Usuário clica "Assinar"
    ↓
PlansPage valida permissões
    ↓
useStripeCheckout() → create-checkout-session
    ↓
Edge Function:
  • Valida JWT
  • Verifica se user é admin
  • Busca/cria Customer no Stripe
  • Cria Checkout Session
  • Registra em audit_log
    ↓
Redireciona para Stripe Checkout
    ↓
Usuário preenche pagamento
    ↓
Stripe processa pagamento
    ↓
Redireciona para /payment-success
    ↓
PaymentSuccess:
  • Aguarda 2 segundos
  • Chama useVerifyPayment() → verify-payment
    ↓
Edge Function verify-payment:
  • Busca session no Stripe
  • Verifica status do pagamento
  • Busca subscription no Stripe
  • Atualiza/cria team_subscriptions
  • Registra em audit_log
    ↓
Retorna sucesso → Dashboard
```

---

## 🚨 Troubleshooting

### Erro: "STRIPE_SECRET_KEY não configurado"
**Solução**: Adicione o secret no Supabase (passo 1)

### Erro: "Este plano ainda não está disponível"
**Solução**: Configure os `stripe_price_id` no banco (passo 3)

### Erro: "Você precisa ser admin"
**Solução**: Certifique-se de estar logado como admin/owner da equipe

### Pagamento aprovado mas assinatura não ativa
**Solução**: 
1. Aguarde até 5 segundos (tempo de verificação)
2. Verifique logs da função `verify-payment`
3. Execute manualmente:
```sql
UPDATE team_subscriptions
SET status = 'active'
WHERE gateway_subscription_id = 'sub_xxx';
```

---

## 🔄 Modo Produção

Para ativar pagamentos reais:

1. **Stripe Dashboard**:
   - Mude para "Live mode"
   - Crie produtos e preços de produção
   - Copie as chaves live

2. **Supabase**:
   - Atualize `STRIPE_SECRET_KEY` para `sk_live_...`
   - Atualize `stripe_price_id` com IDs de produção

3. **Teste completo** antes de liberar para usuários!

---

## 📞 Suporte

- **Stripe Docs**: https://stripe.com/docs/billing/subscriptions/overview
- **Supabase Functions**: https://supabase.com/docs/guides/functions
- **SIGE Support**: Contate o administrador do sistema
