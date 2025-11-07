
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnhancedData } from '@/contexts/EnhancedDataContext';
import { useTeam } from '@/contexts/TeamContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar, Users, Briefcase, CheckCircle, Clock, AlertCircle, DollarSign, Package, AlertTriangle, UserCheck, Circle, TrendingUp } from 'lucide-react';
import { LoadingSpinner } from './shared/LoadingSpinner';
import { EmptyState } from './shared/EmptyState';
import { NoTeamSelected } from './shared/NoTeamSelected';
import { SkeletonCard } from './shared/SkeletonCard';
import { QuickActions } from './dashboard/QuickActions';
import { formatDateShort } from '@/utils/dateUtils';
import * as PayrollCalc from './payroll/payrollCalculations';
import { getCachedEventStatus } from './payroll/eventStatusCache';
import { useSubscriptionGuard } from '@/hooks/useSubscriptionGuard';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/utils/formatters';
import { useEventsInProgress } from '@/hooks/dashboard/useEventsInProgress';
import { useUpcomingPayments } from '@/hooks/dashboard/useUpcomingPayments';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { KpiGroup } from '@/components/dashboard/KpiGroup';
import { FilterChips } from '@/components/dashboard/FilterChips';
import { filterByDateRange, sortByNearestDate, type DateRange } from '@/utils/dashboardFilters';
import { countEventsByRanges } from '@/utils/dashboardFilterCounts';
import { usePersistentFilter } from '@/hooks/usePersistentFilter';
import { Separator } from '@/components/ui/separator';

const Dashboard = () => {
  console.log('🏠 Dashboard: Iniciando renderização');
  
  // ALL HOOKS MUST BE CALLED AT THE TOP LEVEL - BEFORE ANY CONDITIONAL RETURNS
  const { events, personnel, functions, eventSupplierCosts, suppliers, loading } = useEnhancedData();
  const { activeTeam } = useTeam();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = user?.role === 'superadmin';
  const { subscription, isLoading: subscriptionLoading } = useSubscriptionGuard(activeTeam?.id);

  // All useState hooks must be at the top level
  const [superAdminPersonnelCount, setSuperAdminPersonnelCount] = useState<number | null>(null);
  const [eventsWithCompletePayments, setEventsWithCompletePayments] = useState<string[]>([]);
  const { value: eventsRange, setValue: setEventsRange } = usePersistentFilter<DateRange>({
    filterName: 'eventsRange',
    defaultValue: '7dias',
    userId: user?.id,
    teamId: activeTeam?.id,
  });
  const { value: paymentsRange, setValue: setPaymentsRange } = usePersistentFilter<DateRange>({
    filterName: 'paymentsRange',
    defaultValue: '30dias',
    userId: user?.id,
    teamId: activeTeam?.id,
  });

  // Custom dashboard hooks MUST be called unconditionally before any conditional returns
  const eventsInProgress = useEventsInProgress();
  const upcomingPayments = useUpcomingPayments(eventsWithCompletePayments);

  // Check if user is superadmin - HOOK MUST BE CALLED UNCONDITIONALLY
  const { data: isSuperAdminCheck } = useQuery({
    queryKey: ['is-superadmin'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('is_super_admin');
      if (error) throw error;
      return data as boolean;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Fetch total personnel count for super admin - HOOK MUST BE CALLED UNCONDITIONALLY
  useEffect(() => {
    if (isSuperAdmin && !loading) {
      const fetchTotalPersonnel = async () => {
        try {
          const { count, error } = await supabase
            .from('personnel')
            .select('*', { head: true, count: 'exact' });
          
          if (error) {
            console.error('Error fetching personnel count:', error);
            return;
          }
          
          setSuperAdminPersonnelCount(count || 0);
        } catch (error) {
          console.error('Error fetching personnel count:', error);
        }
      };

      fetchTotalPersonnel();
    }
  }, [isSuperAdmin, loading]);

  // Check which events have completed payments using cached data - HOOK MUST BE CALLED UNCONDITIONALLY
  useEffect(() => {
    const checkCompletedPayments = async () => {
      if (!activeTeam || isSuperAdmin) return;

      try {
        // Usar cache para reduzir queries redundantes
        const eventsWithStatus = await getCachedEventStatus(activeTeam.id);

        // Filter events that have allocations but no pending payments
        const completedEventIds = eventsWithStatus
          .filter(e => e.allocated_count > 0 && !e.has_pending_payments)
          .map(e => e.event_id);

        setEventsWithCompletePayments(completedEventIds);
      } catch (error) {
        console.error('Error in checkCompletedPayments:', error);
      }
    };

    checkCompletedPayments();
  }, [events, activeTeam, isSuperAdmin]);

  console.log('🏠 Dashboard: Dados carregados', {
    eventsCount: events?.length || 0,
    personnelCount: personnel?.length || 0,
    functionsCount: functions?.length || 0,
    loading,
    subscriptionLoading,
    activeTeam: activeTeam?.id,
    isSuperAdmin
  });
  
  // Hooks e cálculos baseados em hooks DEVEM ser chamados antes de returns condicionais
  // Data atual usada para filtrar próximos eventos
  const currentDate = new Date();
  const nowKey = currentDate.toDateString();

  // Próximos eventos com ordenação e aplicação de filtro de intervalo
  const upcomingEvents = sortByNearestDate(
    filterByDateRange(events, eventsRange, currentDate),
    currentDate
  ).slice(0, 5);

  // Contagens para chips (useMemo incondicionais)
  const eventsCounts = useMemo(() => countEventsByRanges(events, currentDate), [events, nowKey]);
  const paymentsIntervalCounts: Record<DateRange, number> = useMemo(() => ({
    hoje: filterByDateRange(upcomingPayments, 'hoje', currentDate).length,
    '7dias': filterByDateRange(upcomingPayments, '7dias', currentDate).length,
    '30dias': filterByDateRange(upcomingPayments, '30dias', currentDate).length,
    todos: upcomingPayments.length,
  }), [upcomingPayments, nowKey]);
  
  // CONDITIONAL RETURNS ONLY AFTER ALL HOOKS HAVE BEEN CALLED
  if (!activeTeam && !isSuperAdmin) {
    return <NoTeamSelected />;
  }

  if (loading || subscriptionLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </div>
        
        <SkeletonCard />
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard showSubtitle={false} />
          <SkeletonCard showSubtitle={false} />
          <SkeletonCard showSubtitle={false} />
          <SkeletonCard showSubtitle={false} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  // Calculate unique functions count for super admin (no duplicates by name)
  const uniqueFunctionsCount = isSuperAdmin 
    ? new Set(functions.map(f => f.name.trim().toLowerCase())).size 
    : functions.length;

  // Calculate personnel count based on user role
  const personnelCount = isSuperAdmin && superAdminPersonnelCount !== null 
    ? superAdminPersonnelCount 
    : personnel.length;

  // Filtrar eventos em andamento e próximos (via hook)
  // já chamado no topo

  // Contagens para chips já calculadas via useMemo acima

  // Pagamentos próximos (via hook)
  // já chamado no topo

  // StatusBadge já encapsula as cores e ícones para cada status

  // Ícones e cores foram movidos para StatusBadge

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="rounded-xl border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 p-5 md:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                {isSuperAdmin ? 'Visão Global (Super Admin)' : `Equipe: ${activeTeam?.name || '—'}`}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            {/* Espaço reservado para ações rápidas do topo (ex.: filtros) */}
          </div>
        </div>
      </div>

      {/* Banner de Aviso de Assinatura */}
      {!isSuperAdmin && subscription && subscription.daysUntilExpiration && subscription.daysUntilExpiration <= 7 && subscription.daysUntilExpiration > 0 && subscription.status !== 'trial_expired' && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900">
                  {subscription.status === 'trial' ? 'Trial Expirando em Breve' : 'Assinatura Expirando em Breve'}
                </h3>
                <p className="text-sm text-orange-800 mt-1">
                  {subscription.status === 'trial' 
                    ? `Seu período de trial expira em ${subscription.daysUntilExpiration} dia(s). Assine um plano para continuar usando o SIGE.`
                    : `Sua assinatura ${subscription.planName} expira em ${subscription.daysUntilExpiration} dia(s). Renove agora para continuar usando o SIGE sem interrupções.`
                  }
                </p>
                <Button 
                  size="sm" 
                  className="mt-3"
                  onClick={() => navigate(subscription.status === 'trial' ? '/plans' : '/app/upgrade')}
                >
                  {subscription.status === 'trial' ? 'Escolher Plano' : 'Renovar Assinatura'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <QuickActions />

      {/* KPIs organizados por grupos: Atividade, Cadastro e Financeiro */}
      <div className="space-y-6">
        <KpiGroup title="Atividade" icon={<AlertCircle className="h-4 w-4 text-yellow-600" />}> 
          <div className="sm:col-span-2 lg:col-span-1">
            <KpiCard
              title="Eventos em Andamento"
              value={eventsInProgress.length}
              icon={<AlertCircle className="h-4 w-4 text-yellow-600" />}
              accentClassName="border-yellow-200 bg-yellow-50/50"
              valueClassName="text-yellow-600"
              size="sm"
            />
          </div>
          <KpiCard
            title="Próximos Eventos"
            value={upcomingEvents.length}
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            size="sm"
          />
        </KpiGroup>

        <KpiGroup title="Cadastro" icon={<Users className="h-4 w-4 text-muted-foreground" />}> 
          <KpiCard
            title="Total de Eventos"
            value={events.length}
            icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
            size="sm"
          />
          <KpiCard
            title="Pessoal Cadastrado"
            value={personnelCount}
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            size="sm"
          />
          <KpiCard
            title="Funções Criadas"
            value={uniqueFunctionsCount}
            icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
            size="sm"
          />
        </KpiGroup>

        <KpiGroup title="Financeiro" icon={<DollarSign className="h-4 w-4 text-red-600" />}> 
          <KpiCard
            title="Pagamentos Próximos"
            value={upcomingPayments.length}
            icon={<DollarSign className="h-4 w-4 text-red-600" />}
            accentClassName="border-red-200 bg-red-50/50"
            valueClassName="text-red-600"
            size="sm"
          />
        </KpiGroup>
      </div>

      {/* Estatísticas de Fornecedores (Fase 5) */}
      {!isSuperAdmin && (
        <Card className="bg-muted/30 dark:bg-muted/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4" />
              Fornecedores
            </CardTitle>
            <CardDescription className="text-xs">Resumo dos fornecedores e custos do time ativo</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Separator className="my-2" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <div className="text-center">
                <div className="text-lg font-bold">{suppliers.length}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="hidden sm:inline">Total Cadastrados</span>
                  <span className="sm:hidden">Total</span>
                </p>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">
                  {eventSupplierCosts.filter(c => c.payment_status === 'pending').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="hidden sm:inline">Custos Pendentes</span>
                  <span className="sm:hidden">Pendentes</span>
                </p>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {formatCurrency(eventSupplierCosts
                    .filter(c => c.payment_status === 'paid')
                    .reduce((sum, c) => sum + (c.paid_amount || 0), 0))}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="hidden sm:inline">Total Pago</span>
                  <span className="sm:hidden">Pago</span>
                </p>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">
                  {formatCurrency(eventSupplierCosts
                    .filter(c => c.payment_status !== 'paid')
                    .reduce((sum, c) => sum + ((c.total_amount || 0) - (c.paid_amount || 0)), 0))}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="hidden sm:inline">Total Pendente</span>
                  <span className="sm:hidden">Pendente</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seções principais - Layout otimizado para mobile */}
      <div className={`grid gap-4 md:gap-6 ${isSuperAdmin 
        ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' 
        : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
      }`}>
        {!isSuperAdmin && (
          <Card className="bg-muted/30 dark:bg-muted/20 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                Eventos em Andamento
              </CardTitle>
              <CardDescription className="text-xs">Eventos que estão acontecendo neste momento</CardDescription>
            </CardHeader>
            <CardContent>
              <Separator className="my-2" />
              {eventsInProgress.length === 0 ? (
                <EmptyState
                  title="Nenhum evento em andamento"
                  description="Não há eventos acontecendo no momento."
                  showActiveIcon
                  activeVariant="outline"
                />
              ) : (
            <div className="space-y-2">
                  {eventsInProgress.map(event => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors bg-card">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{event.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDateShort(event.start_date)} - {formatDateShort(event.end_date)}
                        </p>
                      </div>
                      <StatusBadge status={event.status as any} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!isSuperAdmin && (
          <Card className="bg-muted/30 dark:bg-muted/20 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximos Eventos
              </CardTitle>
              <CardDescription className="text-xs">Resumo de próximos eventos ({eventsRange})</CardDescription>
            </CardHeader>
            <CardContent>
              <Separator className="my-2" />
              <div className="mb-3">
                <FilterChips
                  label="Intervalo"
                  options={['hoje','7dias','30dias','todos'] as const}
                  value={eventsRange}
                  onChange={setEventsRange}
                  showCounts
                  counts={eventsCounts}
                  showActiveIcon
                  activeVariant="outline"
                />
              </div>
              {upcomingEvents.length === 0 ? (
                <EmptyState
                  title="Nenhum evento próximo"
                  description="Não há eventos programados para os próximos dias."
                />
              ) : (
                <div className="space-y-2">
                  {upcomingEvents.map(event => (
                    <button 
                      key={event.id} 
                      className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer bg-card"
                      onClick={() => navigate(`/app/eventos/${event.id}`)}
                    >
                      <div className="flex-1 min-w-0 text-left">
                        <h4 className="font-medium truncate">{event.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDateShort(event.start_date)} - {formatDateShort(event.end_date)}
                        </p>
                      </div>
                      <StatusBadge status={event.status as any} />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Card de Pagamentos Próximos - apenas para não-superadmin */}
        {!isSuperAdmin && (
          <Card className="bg-muted/30 dark:bg-muted/20 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-red-600" />
                Pagamentos Próximos
              </CardTitle>
              <CardDescription className="text-xs">Pagamentos próximos (intervalo: {paymentsRange})</CardDescription>
            </CardHeader>
            <CardContent>
              <Separator className="my-2" />
              <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                <FilterChips
                  label="Intervalo"
                  options={['hoje','7dias','30dias','todos'] as const}
                  value={paymentsRange}
                  onChange={setPaymentsRange}
                  showCounts
                  counts={paymentsIntervalCounts}
                  showActiveIcon
                  activeVariant="outline"
                />
              </div>
              {upcomingPayments.length === 0 ? (
                <EmptyState
                  title="Nenhum pagamento próximo"
                  description="Não há pagamentos pendentes ou com vencimento nos próximos 15 dias."
                />
              ) : (
                <div className="space-y-2">
                  {sortByNearestDate(
                      filterByDateRange(upcomingPayments, paymentsRange, currentDate),
                      currentDate
                    ).map(event => {
                    const displayDate = event.payment_due_date 
                      ? formatDateShort(event.payment_due_date)
                      : event.end_date 
                        ? formatDateShort(event.end_date)
                        : 'Data não definida';
                    
                    return (
                      <button 
                        key={event.id} 
                        className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-muted/40 transition-colors border-red-200 bg-red-50/30 dark:bg-muted/20 cursor-pointer"
                        onClick={() => navigate(`/app/folha/${event.id}`)}
                      >
                        <div className="flex-1 min-w-0 text-left">
                          <h4 className="font-medium truncate">{event.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {`Vence: ${displayDate}`}
                          </p>
                        </div>
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300">
                          <AlertCircle className="h-4 w-4" />
                          <span className="ml-1 hidden sm:inline">Pendente</span>
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
