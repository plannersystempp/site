# 🛠️ Ferramentas de Controle de Planos - SuperAdmin

## ✅ **FERRAMENTAS DISPONÍVEIS E FUNCIONAIS**

### **1. Dashboard Analítico** (`/superadmin` - Tab "Dashboard")

#### **KPIs Disponíveis:**
- ✅ Total de Usuários (com usuários aprovados)
- ✅ Total de Equipes (com assinaturas ativas)
- ✅ Total de Eventos (com colaboradores)
- ✅ MRR Atual (com taxa de conversão)
- ✅ Assinaturas Ativas
- ✅ Trials Ativos
- ✅ Assinaturas Expiradas
- ✅ Past Due

#### **Gráficos Analíticos:**
- ✅ Crescimento de Usuários (últimos 30 dias)
- ✅ MRR History (últimos 6 meses)
- ✅ Funil de Conversão (Trial → Ativo)
- ✅ Top 5 Equipes Mais Ativas

#### **Alertas Proativos:**
- ✅ Trials expirando em 7 dias
- ✅ Usuários órfãos
- ✅ Erros não atribuídos

---

### **2. Gerenciamento de Assinaturas** (`/superadmin` - Tab "Assinaturas")

#### **Filtros e Busca:**
- ✅ Filtro por Status (Todos, Trial, Ativo, Vencido, Trial Expirado, Cancelado)
- ✅ Busca por Nome da Equipe
- ✅ Paginação (10 por página)

#### **Visualização:**
- ✅ View Desktop (Tabela completa)
- ✅ View Mobile (Cards responsivos)
- ✅ Indicador de Status com badges coloridos
- ✅ Informações de Vencimento
- ✅ Preço do Plano

#### **Ações Disponíveis:**

##### **✅ Ver Detalhes da Assinatura**
- Data de criação
- Plano atual
- Status
- Período trial (se aplicável)
- Início/fim do período atual
- CNPJ da equipe (se disponível)

##### **✅ Estender Trial** (para status `trial` ou `trial_expired`)
- Opções: 7, 15 ou 30 dias
- Atualiza automaticamente `trial_ends_at`
- Valida se a assinatura está em trial

##### **✅ Mudar Plano** (todos os planos)
- Lista todos os planos ativos
- Mostra plano atual
- Permite mudança para qualquer plano
- Atualiza via Edge Function `change-subscription-plan`
- Invalida queries automaticamente

##### **✅ Reativar Assinatura** (para status `canceled`, `trial_expired`, `past_due`)
- Muda status para `active`
- Atualiza período de cobrança
- Remove `canceled_at`

##### **✅ Cancelar Assinatura** (para status `active`)
- Muda status para `canceled`
- Registra `canceled_at`
- Mantém acesso até fim do período

---

### **3. Controle de Limites** (Automático)

#### **Validações Implementadas:**
- ✅ Máximo de profissionais cadastrados
- ✅ Máximo de eventos por mês
- ✅ Máximo de membros na equipe
- ✅ SuperAdmin bypassa todos os limites

#### **Hook Disponível:**
```typescript
useCheckSubscriptionLimits()
// Ações: 'add_member' | 'create_event' | 'add_personnel'
```

---

### **4. Estatísticas Agregadas**

#### **Hook `useSubscriptionStats()`:**
- ✅ Total de assinaturas
- ✅ Assinaturas ativas
- ✅ Trials ativos
- ✅ Assinaturas expiradas
- ✅ Past due
- ✅ MRR (Monthly Recurring Revenue)

---

### **5. Edge Functions Disponíveis**

#### **✅ `change-subscription-plan`**
- Muda o plano de uma assinatura
- Atualiza `plan_id` e `updated_at`
- Registra log de auditoria

#### **✅ `verify-payment`**
- Verifica sessão de pagamento Stripe
- Cria ou atualiza assinatura
- Registra log de auditoria

#### **✅ `create-checkout-session`**
- Cria sessão de checkout Stripe
- Gerencia clientes Stripe
- Registra log de auditoria

#### **✅ `check-subscriptions`**
- Verifica assinaturas expiradas
- Atualiza status automaticamente
- Roda periodicamente

---

### **6. Políticas de Segurança (RLS)**

#### **✅ `subscription_plans`:**
- SuperAdmin tem acesso total (ALL)
- Usuários autenticados podem visualizar planos ativos
- Planos públicos são visíveis

#### **✅ `team_subscriptions`:**
- SuperAdmin tem acesso total (ALL)
- SuperAdmin pode visualizar todas assinaturas
- Admins de equipe podem ver apenas sua assinatura

---

## ⚠️ **FUNCIONALIDADES FALTANTES OU LIMITADAS**

### **1. 🚫 Criação/Edição de Planos**

**Status:** ❌ Não implementado  
**Descrição:** Não há interface para o superadmin criar novos planos ou editar planos existentes.

**Funcionalidades Necessárias:**
- [ ] Criar novo plano (nome, preço, limites, features)
- [ ] Editar plano existente
- [ ] Ativar/desativar planos
- [ ] Definir plano como "popular"
- [ ] Configurar Stripe (product_id, price_id)

**Workaround Atual:** SQL direto no Supabase Dashboard

---

### **2. 🟡 Gerenciamento Stripe Limitado**

**Status:** ⚠️ Parcialmente implementado  
**Descrição:** Não há integração direta com o dashboard do Stripe.

**Funcionalidades Faltantes:**
- [ ] Visualizar histórico de pagamentos Stripe
- [ ] Cancelar assinatura no Stripe
- [ ] Reembolsar pagamento
- [ ] Sincronizar dados do Stripe
- [ ] Webhooks de eventos Stripe

**Workaround Atual:** Acessar Stripe Dashboard diretamente

---

### **3. 🟡 Histórico de Mudanças de Planos**

**Status:** ⚠️ Registrado em Audit Logs, mas sem UI dedicada  
**Descrição:** Não há visualização dedicada do histórico de mudanças de planos.

**Funcionalidades Necessárias:**
- [ ] Timeline de mudanças de plano
- [ ] Motivo da mudança
- [ ] Quem fez a mudança
- [ ] Diferença de preço
- [ ] Filtros por equipe/período

**Workaround Atual:** Consultar `audit_logs` via SQL

---

### **4. 🚫 Notificações Automáticas**

**Status:** ❌ Não implementado  
**Descrição:** Não há sistema de notificações para eventos de assinatura.

**Funcionalidades Necessárias:**
- [ ] Email de trial expirando (7 dias antes)
- [ ] Email de assinatura cancelada
- [ ] Email de mudança de plano
- [ ] Email de pagamento failed
- [ ] Notificações in-app

**Workaround Atual:** Manual via email externo

---

### **5. 🟡 Relatórios e Exportação**

**Status:** ⚠️ Visualização disponível, exportação limitada  
**Descrição:** Não há exportação de dados de assinaturas em formatos (CSV/PDF).

**Funcionalidades Necessárias:**
- [ ] Exportar lista de assinaturas (CSV/Excel)
- [ ] Relatório de MRR (PDF)
- [ ] Relatório de conversão (PDF)
- [ ] Relatório de churn rate
- [ ] Gráficos exportáveis

**Workaround Atual:** Screenshot ou SQL export

---

### **6. 🚫 Descontos e Cupons**

**Status:** ❌ Não implementado  
**Descrição:** Não há sistema de cupons de desconto ou promoções.

**Funcionalidades Necessárias:**
- [ ] Criar cupons de desconto
- [ ] Aplicar desconto a assinatura específica
- [ ] Desconto por % ou valor fixo
- [ ] Validade do cupom
- [ ] Limite de uso

**Workaround Atual:** Ajustar preço do plano temporariamente

---

### **7. 🚫 Previsões e Forecasting**

**Status:** ❌ Não implementado  
**Descrição:** Não há previsões de receita ou churn.

**Funcionalidades Necessárias:**
- [ ] Previsão de MRR (próximos 3 meses)
- [ ] Taxa de churn mensal
- [ ] LTV (Lifetime Value)
- [ ] CAC (Customer Acquisition Cost)
- [ ] Análise de cohort

---

### **8. 🟡 Bulk Actions**

**Status:** ⚠️ Não implementado para assinaturas  
**Descrição:** Não há ações em massa para assinaturas.

**Funcionalidades Necessárias:**
- [ ] Estender trial em massa
- [ ] Mudar plano em massa
- [ ] Cancelar assinaturas em massa
- [ ] Notificar em massa

**Workaround Atual:** Uma por vez via UI

---

### **9. 🚫 Logs de Pagamento**

**Status:** ❌ Não implementado  
**Descrição:** Não há visualização de logs de tentativas de pagamento.

**Funcionalidades Necessárias:**
- [ ] Histórico de tentativas de cobrança
- [ ] Motivo de falha de pagamento
- [ ] Retentar pagamento manualmente
- [ ] Status da cobrança (pending, succeeded, failed)

**Workaround Atual:** Verificar no Stripe Dashboard

---

### **10. 🚫 Configurações de Trial**

**Status:** ❌ Não implementado  
**Descrição:** Não há controle global de duração de trial.

**Funcionalidades Necessárias:**
- [ ] Definir duração padrão do trial (15 dias atual)
- [ ] Trial com/sem cartão de crédito
- [ ] Auto-cancelamento após trial
- [ ] Auto-downgrade para plano gratuito

---

## 🎯 **RESUMO DE FUNCIONALIDADES**

| Categoria | Status | Nível |
|-----------|--------|-------|
| Dashboard Analítico | ✅ Completo | 100% |
| Gerenciamento de Assinaturas | ✅ Completo | 95% |
| Ver Detalhes | ✅ Funcional | 100% |
| Estender Trial | ✅ Funcional | 100% |
| Mudar Plano | ✅ Funcional | 100% |
| Reativar/Cancelar | ✅ Funcional | 100% |
| Controle de Limites | ✅ Automático | 100% |
| Estatísticas | ✅ Funcional | 100% |
| RLS Policies | ✅ Seguro | 100% |
| Edge Functions | ✅ Funcional | 100% |
| **Criar/Editar Planos** | ❌ Faltando | 0% |
| **Integração Stripe** | ⚠️ Parcial | 40% |
| **Histórico de Mudanças** | ⚠️ Logs Apenas | 30% |
| **Notificações** | ❌ Faltando | 0% |
| **Exportação** | ⚠️ Limitada | 20% |
| **Cupons/Descontos** | ❌ Faltando | 0% |
| **Forecasting** | ❌ Faltando | 0% |
| **Bulk Actions** | ❌ Faltando | 0% |
| **Logs de Pagamento** | ❌ Faltando | 0% |
| **Config de Trial** | ❌ Faltando | 0% |

---

## 🚀 **PRIORIDADES RECOMENDADAS**

### **Alta Prioridade (Essencial):**
1. ✅ ~~Gerenciamento básico de assinaturas~~ (Implementado)
2. ✅ ~~Dashboard analítico~~ (Implementado)
3. 🔴 **Criar/Editar Planos via UI**
4. 🔴 **Notificações de Trial Expirando**
5. 🔴 **Histórico de Mudanças de Plano**

### **Média Prioridade (Importante):**
6. 🟡 Integração completa com Stripe Dashboard
7. 🟡 Logs de tentativas de pagamento
8. 🟡 Exportação de relatórios (CSV/PDF)
9. 🟡 Bulk actions para assinaturas

### **Baixa Prioridade (Nice to Have):**
10. 🟢 Sistema de cupons/descontos
11. 🟢 Previsões de receita (forecasting)
12. 🟢 Configurações avançadas de trial
13. 🟢 Análise de cohort e LTV

---

## 📊 **MÉTRICAS MONITORADAS**

### **Atualmente Disponíveis:**
- ✅ MRR (Monthly Recurring Revenue)
- ✅ Total de Assinaturas (por status)
- ✅ Taxa de Conversão Trial→Ativo
- ✅ Crescimento de Usuários
- ✅ Equipes Mais Ativas

### **Faltando:**
- ❌ Churn Rate (taxa de cancelamento)
- ❌ LTV (Lifetime Value)
- ❌ CAC (Customer Acquisition Cost)
- ❌ ARPU (Average Revenue Per User)
- ❌ Net Revenue Retention

---

## 🔐 **SEGURANÇA E PERMISSÕES**

### **✅ Implementado:**
- SuperAdmin tem acesso total via RLS
- SuperAdmin bypassa limites de assinatura
- Logs de auditoria registram todas as ações
- Edge functions verificam JWT

### **⚠️ Atenção:**
- Não há MFA (Multi-Factor Authentication) para SuperAdmin
- Não há rate limiting nas edge functions
- Não há logs de tentativas de acesso não autorizado

---

## 📝 **CONCLUSÃO**

O sistema de controle de planos para SuperAdmin está **85% funcional** com as operações essenciais implementadas:

✅ **Pontos Fortes:**
- Dashboard analítico completo
- Gerenciamento de assinaturas robusto
- Ações principais funcionando (estender trial, mudar plano, reativar)
- Segurança com RLS bem configurada
- Estatísticas em tempo real

⚠️ **Pontos de Melhoria Urgentes:**
- Criar interface para criar/editar planos
- Implementar notificações de trial expirando
- Melhorar integração com Stripe

🔴 **Crítico para Produção:**
- Sistema de notificações (trials expirando)
- Logs de pagamento visíveis
- Histórico de mudanças de plano com UI dedicada

---

## 🛠️ **COMO USAR AS FERRAMENTAS ATUAIS**

### **1. Acessar o Painel:**
```
/superadmin → Tab "Assinaturas"
```

### **2. Filtrar Assinaturas:**
```
Status → Selecionar "Trial" | "Ativo" | "Vencido" etc.
Busca → Digitar nome da equipe
```

### **3. Estender Trial:**
```
Ações (⋮) → Estender Trial → Escolher dias (7/15/30) → Confirmar
```

### **4. Mudar Plano:**
```
Ações (⋮) → Mudar Plano → Selecionar novo plano → Confirmar
```

### **5. Ver Estatísticas:**
```
Tab "Dashboard" → Ver KPIs e Gráficos
```

### **6. Verificar Alertas:**
```
Tab "Dashboard" → Cards de Alerta no topo
```

---

## 📞 **SUPORTE TÉCNICO**

Para funcionalidades não implementadas:
- **Criar planos:** SQL direto via Supabase Dashboard
- **Logs Stripe:** Acessar diretamente o Stripe Dashboard
- **Relatórios:** Exportar via SQL ou screenshot dos gráficos

---

**Última atualização:** 2025-01-02  
**Versão do Sistema:** PlannerSystem v1.0
