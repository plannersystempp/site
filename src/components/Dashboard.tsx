
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnhancedData } from '@/contexts/EnhancedDataContext';
import { useTeam } from '@/contexts/TeamContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Briefcase, CheckCircle, Clock, AlertCircle, DollarSign } from 'lucide-react';
import { LoadingSpinner } from './shared/LoadingSpinner';
import { EmptyState } from './shared/EmptyState';
import { NoTeamSelected } from './shared/NoTeamSelected';
import { SkeletonCard } from './shared/SkeletonCard';
import { QuickActions } from './dashboard/QuickActions';
import { formatDateShort } from '@/utils/dateUtils';
import * as PayrollCalc from './payroll/payrollCalculations';

const Dashboard = () => {
  const { events, personnel, functions, loading } = useEnhancedData();
  const { activeTeam } = useTeam();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = user?.role === 'superadmin';
  
  const [superAdminPersonnelCount, setSuperAdminPersonnelCount] = useState<number | null>(null);
  
  // State to track events with complete payments - moved to top to follow Rules of Hooks
  const [eventsWithCompletePayments, setEventsWithCompletePayments] = useState<Set<string>>(new Set());

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

  // Check for complete payments when events change - moved to top to follow Rules of Hooks
  useEffect(() => {
    const checkCompletePayments = async () => {
      if (!events.length || isSuperAdmin) return;

      const completeEvents = new Set<string>();

      // Check each event for complete payments
      for (const event of events) {
        try {
          // Get allocations first to get personnel IDs
          const { data: allocationsData } = await supabase
            .from('personnel_allocations')
            .select('*')
            .eq('event_id', event.id);

          const allocations = allocationsData || [];
          if (!allocations.length) continue;

          // Get all other data needed for calculations
          const [workLogsData, closingsData, absencesData, personnelData] = await Promise.all([
            supabase
              .from('work_records')
              .select('*')
              .eq('event_id', event.id),
            supabase
              .from('payroll_closings')
              .select('*')
              .eq('event_id', event.id),
            supabase
              .from('absences')
              .select(`
                *,
                personnel_allocations!inner(event_id)
              `)
              .eq('personnel_allocations.event_id', event.id),
            supabase
              .from('personnel')
              .select('*')
              .in('id', allocations.map(a => a.personnel_id))
          ]);

          const workLogs = workLogsData.data || [];
          const closings = closingsData.data || [];
          const absences = absencesData.data || [];
          const personnelMap = new Map((personnelData.data || []).map(p => [p.id, p]));

          // Group allocations by personnel_id
          const groupedAllocations = allocations.reduce((acc, allocation) => {
            const personnelId = allocation.personnel_id;
            if (!acc[personnelId]) {
              acc[personnelId] = [];
            }
            acc[personnelId].push(allocation);
            return acc;
          }, {} as Record<string, any[]>);

          // Check if all personnel have complete payments
          let allPaid = true;
          
          // Não marcar como completo se não há work_records E não há payroll_closings
          if (workLogs.length === 0 && closings.length === 0) {
            allPaid = false;
          } else {
            for (const [personnelId, personAllocations] of Object.entries(groupedAllocations)) {
              const person = personnelMap.get(personnelId);
              if (!person) continue;

              // Filter data for this person
              const personWorkLogs = workLogs.filter(log => log.employee_id === personnelId);
              const personAbsences = (absences as any[]).filter((absence: any) => 
                (personAllocations as any[]).some((allocation: any) => allocation.id === absence.assignment_id)
              );
              const paymentRecords = closings.filter(closing => closing.personnel_id === personnelId);

              // Calculate using same logic as usePayrollData
              const totalPay = PayrollCalc.calculateTotalPay(
                personAllocations as any,
                person as any,
                personWorkLogs as any,
                personAbsences as any
              );
              const totalPaidAmount = PayrollCalc.calculateTotalPaid(paymentRecords as any);
              const pendingAmount = PayrollCalc.calculatePendingAmount(totalPay, totalPaidAmount);

              // Não marcar como completo se existe totalPay > 0 mas totalPaidAmount === 0
              if (totalPay > 0 && totalPaidAmount === 0) {
                allPaid = false;
                break;
              }

              // If any person has pending amount, event is not complete
              if (pendingAmount > 0) {
                allPaid = false;
                break;
              }
            }
          }

          if (allPaid) {
            completeEvents.add(event.id);
          }
        } catch (error) {
          console.error('Error checking payments for event:', event.id, error);
        }
      }

      setEventsWithCompletePayments(completeEvents);
    };

    checkCompletePayments();
  }, [events, isSuperAdmin]);
  
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
      // Excluir eventos cancelados
      if (event.status === 'cancelado') return false;
      
      // Excluir eventos com pagamentos completos
      if (eventsWithCompletePayments.has(event.id)) return false;
      
      // Incluir eventos com status 'concluido_pagamento_pendente' sempre (independente da data)
      if (event.status === 'concluido_pagamento_pendente') return true;
      
      // Excluir apenas eventos explicitamente marcados como 'concluido' (totalmente pagos)
      if (event.status === 'concluido') return false;
      
      // Para outros eventos, verificar se payment_due_date está dentro da janela de 15 dias
      // Sem limite no passado (inclui atrasados)
      const dueDate = event.payment_due_date 
        ? new Date(event.payment_due_date + 'T12:00:00')
        : event.end_date 
          ? new Date(event.end_date + 'T12:00:00')
          : null;
      
      // Se não tem data de vencimento nem data de término, excluir
      if (!dueDate) return false;
      
      // Incluir se está dentro da janela: sem limite passado, até D+15
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
                          {event.status === 'concluido_pagamento_pendente' 
                            ? 'Pagamento pendente' 
                            : `Vence: ${displayDate}`
                          }
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
