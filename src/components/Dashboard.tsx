
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnhancedData } from '@/contexts/EnhancedDataContext';
import { useTeam } from '@/contexts/TeamContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Briefcase, CheckCircle, Clock, AlertCircle, DollarSign, Package } from 'lucide-react';
import { LoadingSpinner } from './shared/LoadingSpinner';
import { EmptyState } from './shared/EmptyState';
import { NoTeamSelected } from './shared/NoTeamSelected';
import { SkeletonCard } from './shared/SkeletonCard';
import { QuickActions } from './dashboard/QuickActions';
import { formatDateShort } from '@/utils/dateUtils';
import * as PayrollCalc from './payroll/payrollCalculations';
import { getCachedEventStatus } from './payroll/eventStatusCache';

const Dashboard = () => {
  const { events, personnel, functions, eventSupplierCosts, suppliers, loading } = useEnhancedData();
  const { activeTeam } = useTeam();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = user?.role === 'superadmin';
  
  const [superAdminPersonnelCount, setSuperAdminPersonnelCount] = useState<number | null>(null);
  
  // State to track events with complete payments - moved to top to follow Rules of Hooks
  const [eventsWithCompletePayments, setEventsWithCompletePayments] = useState<string[]>([]);

  // Fetch total personnel count for super admin
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

  // Check which events have completed payments using cached data
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
  
  if (!activeTeam && !isSuperAdmin) {
    return <NoTeamSelected />;
  }

  if (loading) {
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

  // Filtrar eventos em andamento e próximos
  const currentDate = new Date();
  const eventsInProgress = events.filter(event => {
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    return startDate <= currentDate && endDate >= currentDate;
  });

  const upcomingEvents = events.filter(event => {
    const startDate = new Date(event.start_date);
    return startDate > currentDate;
  }).slice(0, 5);

  // Pagamentos próximos nos próximos 15 dias (D+0 a D+15) - excluindo eventos com pagamentos completos
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fifteenDaysFromNow = new Date();
  fifteenDaysFromNow.setDate(today.getDate() + 15);
  fifteenDaysFromNow.setHours(23, 59, 59, 999);

  const upcomingPayments = events
    .filter(event => {
      // Excluir apenas eventos cancelados
      if (event.status === 'cancelado') return false;
      
      // Excluir apenas eventos com pagamentos REALMENTE completos
      if (eventsWithCompletePayments.includes(event.id)) return false;
      
      // Incluir eventos com status 'concluido_pagamento_pendente' sempre
      if (event.status === 'concluido_pagamento_pendente') return true;
      
      // Para outros eventos (incluindo 'concluido'), verificar data de vencimento
      const dueDate = event.payment_due_date 
        ? new Date(event.payment_due_date + 'T12:00:00')
        : event.end_date 
          ? new Date(event.end_date + 'T12:00:00')
          : null;
      
      // Se não tem data de vencimento nem data de término, excluir
      if (!dueDate) return false;
      
      // Incluir se vencimento <= D+15 (sem limite no passado para incluir atrasados)
      return dueDate <= fifteenDaysFromNow;
    })
    .sort((a, b) => {
      // Eventos com status 'concluido_pagamento_pendente' aparecem primeiro
      if (a.status === 'concluido_pagamento_pendente' && b.status !== 'concluido_pagamento_pendente') return -1;
      if (b.status === 'concluido_pagamento_pendente' && a.status !== 'concluido_pagamento_pendente') return 1;
      
      // Depois ordenar por data de vencimento (atrasados e mais próximos primeiro)
      const dateA = a.payment_due_date 
        ? new Date(a.payment_due_date) 
        : a.end_date 
          ? new Date(a.end_date)
          : new Date('9999-12-31');
      const dateB = b.payment_due_date 
        ? new Date(b.payment_due_date) 
        : b.end_date 
          ? new Date(b.end_date)
          : new Date('9999-12-31');
      return dateA.getTime() - dateB.getTime();
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planejado':
        return 'bg-blue-100 text-blue-800';
      case 'em_andamento':
        return 'bg-yellow-100 text-yellow-800';
      case 'concluido':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      case 'concluido_pagamento_pendente':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planejado':
        return <Clock className="h-4 w-4" />;
      case 'em_andamento':
        return <AlertCircle className="h-4 w-4" />;
      case 'concluido':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelado':
        return <AlertCircle className="h-4 w-4" />;
      case 'concluido_pagamento_pendente':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {isSuperAdmin ? 'Visão Global (Super Admin)' : `Equipe: ${activeTeam?.name}`}
          </p>
        </div>
      </div>

      <QuickActions />

      {/* Grid de KPIs com destaque para eventos em andamento */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI em destaque - Eventos em Andamento (largura total em mobile) */}
        <Card className="col-span-2 lg:col-span-1 border-yellow-200 bg-yellow-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos em Andamento</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{eventsInProgress.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {eventsInProgress.length === 0 ? 'Nenhum evento ativo' : 'Em execução agora'}
            </p>
          </CardContent>
        </Card>

        {/* Outros KPIs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pessoal Cadastrado</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personnelCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funções Criadas</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueFunctionsCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas de Fornecedores (Fase 5) */}
      {!isSuperAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Fornecedores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold">{suppliers.length}</div>
                <p className="text-xs text-muted-foreground">Total Cadastrados</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {eventSupplierCosts.filter(c => c.payment_status === 'pending').length}
                </div>
                <p className="text-xs text-muted-foreground">Custos Pendentes</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  R$ {eventSupplierCosts
                    .filter(c => c.payment_status === 'paid')
                    .reduce((sum, c) => sum + (c.paid_amount || 0), 0)
                    .toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Total Pago</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  R$ {eventSupplierCosts
                    .filter(c => c.payment_status !== 'paid')
                    .reduce((sum, c) => sum + ((c.total_amount || 0) - (c.paid_amount || 0)), 0)
                    .toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Total Pendente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Eventos em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eventsInProgress.length === 0 ? (
              <EmptyState
                title="Nenhum evento em andamento"
                description="Não há eventos acontecendo no momento."
              />
            ) : (
              <div className="space-y-2">
                {eventsInProgress.map(event => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{event.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDateShort(event.start_date)} - {formatDateShort(event.end_date)}
                      </p>
                    </div>
                    <Badge className={getStatusColor(event.status)}>
                      {getStatusIcon(event.status)}
                      <span className="ml-1 hidden sm:inline">{event.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                    className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/app/eventos/${event.id}`)}
                  >
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className="font-medium truncate">{event.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDateShort(event.start_date)} - {formatDateShort(event.end_date)}
                      </p>
                    </div>
                    <Badge className={getStatusColor(event.status)}>
                      {getStatusIcon(event.status)}
                      <span className="ml-1 hidden sm:inline">{event.status.replace('_', ' ')}</span>
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-red-600" />
              Pagamentos Próximos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingPayments.length === 0 ? (
              <EmptyState
                title="Nenhum pagamento próximo"
                description="Não há pagamentos pendentes ou com vencimento nos próximos 15 dias."
              />
            ) : (
              <div className="space-y-2">
                {upcomingPayments.map(event => {
                  const displayDate = event.payment_due_date 
                    ? formatDateShort(event.payment_due_date)
                    : event.end_date 
                      ? formatDateShort(event.end_date)
                      : 'Data não definida';
                  
                  return (
                    <button 
                      key={event.id} 
                      className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors border-red-200 bg-red-50/30 cursor-pointer"
                      onClick={() => navigate(`/app/folha/${event.id}`)}
                    >
                      <div className="flex-1 min-w-0 text-left">
                        <h4 className="font-medium truncate">{event.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {`Vence: ${displayDate}`}
                        </p>
                      </div>
                      <Badge className="bg-red-100 text-red-800">
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
      </div>
    </div>
  );
};

export default Dashboard;
