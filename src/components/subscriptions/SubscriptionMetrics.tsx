import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Percent } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface MetricsData {
  mrr: number;
  mrr_growth: number;
  total_customers: number;
  trial_to_paid_rate: number;
  churn_rate: number;
  avg_ltv: number;
}

export function SubscriptionMetrics() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['subscription-metrics'],
    queryFn: async (): Promise<MetricsData> => {
      // Buscar todas assinaturas (excluindo sistema)
      const { data: subscriptions, error } = await supabase
        .from('team_subscriptions')
        .select(`
          id,
          status,
          created_at,
          trial_ends_at,
          subscription_plans!inner(price),
          teams!inner(is_system)
        `)
        .eq('teams.is_system', false);

      if (error) throw error;

      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());

      // Calcular MRR atual
      const currentMRR = subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + Number((s.subscription_plans as any).price || 0), 0);

      // Calcular MRR do mês anterior
      const lastMonthSubs = subscriptions.filter(
        s => new Date(s.created_at) <= lastMonth && (s.status === 'active' || s.status === 'canceled')
      );
      const lastMonthMRR = lastMonthSubs
        .filter(s => {
          const createdAt = new Date(s.created_at);
          return createdAt <= lastMonth && s.status === 'active';
        })
        .reduce((sum, s) => sum + Number((s.subscription_plans as any).price || 0), 0);

      // Crescimento MRR
      const mrrGrowth = lastMonthMRR > 0 ? ((currentMRR - lastMonthMRR) / lastMonthMRR) * 100 : 0;

      // Total de clientes ativos
      const totalCustomers = subscriptions.filter(s => s.status === 'active').length;

      // Taxa de conversão trial → paid
      const trialsStarted = subscriptions.filter(s => s.trial_ends_at).length;
      const trialsConverted = subscriptions.filter(
        s => s.trial_ends_at && s.status === 'active'
      ).length;
      const trialToPaidRate = trialsStarted > 0 ? (trialsConverted / trialsStarted) * 100 : 0;

      // Churn rate (últimos 30 dias)
      const canceledLastMonth = subscriptions.filter(
        s => s.status === 'canceled' && new Date(s.created_at) >= lastMonth
      ).length;
      const activeLastMonth = subscriptions.filter(
        s => new Date(s.created_at) <= lastMonth && s.status === 'active'
      ).length;
      const churnRate = activeLastMonth > 0 ? (canceledLastMonth / activeLastMonth) * 100 : 0;

      // LTV médio (simplificado: MRR * 12 / churn_rate)
      // Assumindo que churn_rate é mensal e LTV = ARPU / churn_rate
      const arpu = totalCustomers > 0 ? currentMRR / totalCustomers : 0;
      const avgLTV = churnRate > 0 ? (arpu * 12) / (churnRate / 100) : arpu * 24; // fallback: 24 meses

      return {
        mrr: currentMRR,
        mrr_growth: mrrGrowth,
        total_customers: totalCustomers,
        trial_to_paid_rate: trialToPaidRate,
        churn_rate: churnRate,
        avg_ltv: avgLTV,
      };
    },
    refetchInterval: 60000, // Atualizar a cada 60 segundos
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Métricas Avançadas de Assinaturas</h3>
        <p className="text-sm text-muted-foreground">
          Indicadores estratégicos para tomada de decisão
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* MRR */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR (Receita Mensal Recorrente)</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics?.mrr || 0)}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              {(metrics?.mrr_growth || 0) >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={(metrics?.mrr_growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatPercent(metrics?.mrr_growth || 0)}
              </span>
              <span>vs. mês anterior</span>
            </div>
          </CardContent>
        </Card>

        {/* Total de Clientes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_customers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Assinaturas pagas atualmente
            </p>
          </CardContent>
        </Card>

        {/* Taxa de Conversão Trial → Paid */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão (Trial → Paid)</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercent(metrics?.trial_to_paid_rate || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Trials que viraram clientes pagos
            </p>
          </CardContent>
        </Card>

        {/* Churn Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate (Últimos 30 dias)</CardTitle>
            <Percent className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercent(metrics?.churn_rate || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Taxa de cancelamento mensal
            </p>
          </CardContent>
        </Card>

        {/* LTV Médio */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LTV Médio (Lifetime Value)</CardTitle>
            <DollarSign className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics?.avg_ltv || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Valor estimado por cliente
            </p>
          </CardContent>
        </Card>

        {/* ARPU */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ARPU (Receita Média por Usuário)</CardTitle>
            <DollarSign className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                (metrics?.total_customers || 0) > 0
                  ? (metrics?.mrr || 0) / (metrics?.total_customers || 1)
                  : 0
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              MRR dividido por clientes ativos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Informações adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Sobre as Métricas</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-2">
          <p>
            <strong>MRR:</strong> Receita mensal recorrente de todas as assinaturas ativas.
          </p>
          <p>
            <strong>Taxa de Conversão:</strong> Percentual de trials que se tornaram assinaturas pagas.
          </p>
          <p>
            <strong>Churn Rate:</strong> Percentual de clientes que cancelaram nos últimos 30 dias.
          </p>
          <p>
            <strong>LTV:</strong> Valor estimado que um cliente gera durante todo o relacionamento (baseado em ARPU e churn).
          </p>
          <p>
            <strong>ARPU:</strong> Receita média mensal por cliente ativo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
