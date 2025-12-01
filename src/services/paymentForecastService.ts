// Idioma: pt-BR
// Serviço de Previsão de Pagamentos (SoC): agrega dados de eventos e pagamentos avulsos por semana
import { supabase } from '@/integrations/supabase/client';
import type { ForecastItem, WeekForecast } from './paymentForecastUtils';
import { groupItemsByWeek } from './paymentForecastUtils';

export type { WeekForecast, ForecastItem };

// Busca eventos com payment_due_date no intervalo e seus saldos pendentes via event_payroll
export async function fetchEventForecast(teamId: string, startDate: string, endDate: string): Promise<ForecastItem[]> {
  // Busca eventos com payment_due_date dentro do intervalo
  const { data: eventsDueDate, error } = await supabase
    .from('events')
    .select('id, name, location, payment_due_date, end_date, status')
    .eq('team_id', teamId)
    .gte('payment_due_date', startDate)
    .lte('payment_due_date', endDate);

  if (error) throw error;

  // Fallback: incluir eventos SEM payment_due_date cujo end_date implica vencimento no intervalo (end_date + 7 dias)
  const toDate = (iso: string) => new Date(`${iso}T12:00:00`);
  const toIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const startMinus7 = (() => { const d = toDate(startDate); d.setDate(d.getDate() - 7); return toIso(d); })();
  const endMinus7 = (() => { const d = toDate(endDate); d.setDate(d.getDate() - 7); return toIso(d); })();

  const { data: eventsNoDue } = await supabase
    .from('events')
    .select('id, name, location, payment_due_date, end_date, status')
    .eq('team_id', teamId)
    .is('payment_due_date', null)
    .gte('end_date', startMinus7)
    .lte('end_date', endMinus7);

  const allEvents = ([...(eventsDueDate || []), ...(eventsNoDue || [])]) as any[];

  const eventIds = allEvents.map((e: any) => e.id);
  let payrollRows: any[] = [];
  let closingRows: any[] = [];
  let allocationsRows: any[] = [];
  
  if (eventIds.length > 0) {
    const { data: payroll } = await supabase
      .from('event_payroll')
      .select('event_id, remaining_balance, total_gross, total_paid, team_id')
      .eq('team_id', teamId)
      .in('event_id', eventIds);
    payrollRows = Array.isArray(payroll) ? payroll : [];
    
    // Fallback por event_id (alguns registros antigos podem não ter team_id)
    if (!payrollRows.length) {
      const { data: payrollByEvent } = await supabase
        .from('event_payroll')
        .select('event_id, remaining_balance, total_gross, total_paid, team_id')
        .in('event_id', eventIds);
      payrollRows = Array.isArray(payrollByEvent) ? payrollByEvent : [];
    }

    // Buscar folhas de pagamento registradas para os eventos (indica fechamento em andamento)
    const { data: closings } = await supabase
      .from('payroll_closings')
      .select('event_id, id, total_amount_paid')
      .eq('team_id', teamId)
      .in('event_id', eventIds);
    closingRows = Array.isArray(closings) ? closings : [];
    
    if (!closingRows.length) {
      const { data: closingsByEvent } = await supabase
        .from('payroll_closings')
        .select('event_id, id, total_amount_paid')
        .in('event_id', eventIds);
      closingRows = Array.isArray(closingsByEvent) ? closingsByEvent : [];
    }

    // Buscar alocações de pessoal para calcular valores estimados
    const { data: allocations } = await supabase
      .from('personnel_allocations')
      .select(`
        event_id,
        work_days,
        event_specific_cache,
        personnel:personnel_id (event_cache)
      `)
      .eq('team_id', teamId)
      .in('event_id', eventIds);
    allocationsRows = Array.isArray(allocations) ? allocations : [];
  }

  // Calcular valores de event_payroll (consolidados)
  const remainingByEvent: Record<string, number> = {};
  payrollRows.forEach((row) => {
    const remainingBalance = row?.remaining_balance;
    const gross = Number(row?.total_gross ?? 0);
    const paid = Number(row?.total_paid ?? 0);
    const computed = Math.max(gross - paid, 0);
    const pending = Math.max(Number(remainingBalance ?? computed ?? 0), 0);
    remainingByEvent[row.event_id] = pending;
  });

  // Calcular valores estimados baseados em alocações
  const estimatedByEvent: Record<string, number> = {};
  allocationsRows.forEach((alloc: any) => {
    const cache = Number(alloc.event_specific_cache || alloc.personnel?.event_cache || 0);
    const days = Array.isArray(alloc.work_days) ? alloc.work_days.length : 0;
    const value = cache * days;
    estimatedByEvent[alloc.event_id] = (estimatedByEvent[alloc.event_id] || 0) + value;
  });

  // Calcular total já pago via payroll_closings
  const paidByEvent: Record<string, number> = {};
  closingRows.forEach((row: any) => {
    const paid = Number(row.total_amount_paid || 0);
    paidByEvent[row.event_id] = (paidByEvent[row.event_id] || 0) + paid;
  });

  // Contar fechamentos por evento
  const closingsCountByEvent: Record<string, number> = {};
  closingRows.forEach((row) => {
    const key = String(row.event_id);
    closingsCountByEvent[key] = (closingsCountByEvent[key] || 0) + 1;
  });

  const items: ForecastItem[] = (allEvents || [])
    .map((e: any) => {
      let due: string | null = (e.payment_due_date as string | null) ?? null;
      if (!due && e.end_date) {
        const d = new Date(`${e.end_date}T12:00:00`);
        d.setDate(d.getDate() + 7);
        due = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }
      
      // Calcular valor final: prioriza event_payroll, fallback para estimativa
      const fromPayroll = remainingByEvent[e.id];
      const estimated = estimatedByEvent[e.id] || 0;
      const paid = paidByEvent[e.id] || 0;
      const amount = fromPayroll !== undefined 
        ? fromPayroll 
        : Math.max(estimated - paid, 0);
      
      if (!due) return null;

      // Regras de inclusão expandidas
      const hasAllocations = estimated > 0;
      const isPendingByStatus = e.status === 'concluido_pagamento_pendente';
      const hasClosings = (closingsCountByEvent[String(e.id)] || 0) > 0;
      const shouldInclude = amount > 0.01 || isPendingByStatus || hasClosings || hasAllocations;
      
      if (!shouldInclude) return null;

      // Notas contextuais
      const isEstimated = fromPayroll === undefined && hasAllocations;
      const notes = isEstimated
        ? 'Valor estimado (folha não consolidada)'
        : isPendingByStatus
        ? amount > 0.01
          ? 'Pagamento pendente'
          : 'Pagamento pendente (valor ainda não consolidado)'
        : hasClosings
        ? 'Em processo de fechamento'
        : null;

      return {
        kind: 'evento',
        id: String(e.id),
        name: String(e.name || 'Evento'),
        location: e.location || null,
        dueDate: due,
        amount,
        notes,
      } satisfies ForecastItem;
    })
    .filter(Boolean) as ForecastItem[];

  return items;
}

// Busca pagamentos avulsos pendentes no intervalo
export async function fetchAvulsoForecast(teamId: string, startDate: string, endDate: string): Promise<ForecastItem[]> {
  const { data, error } = await supabase
    .from('personnel_payments')
    .select(`
      id,
      amount,
      payment_due_date,
      description,
      notes,
      personnel:personnel_id (id, name)
    `)
    .eq('team_id', teamId)
    .eq('payment_status', 'pending')
    .gte('payment_due_date', startDate)
    .lte('payment_due_date', endDate)
    .order('payment_due_date', { ascending: true });

  if (error) throw error;

  return (data || []).map((p: any) => ({
    kind: 'avulso',
    id: String(p.id),
    name: String(p.description || 'Pagamento Avulso'),
    location: null,
    dueDate: p.payment_due_date as string,
    amount: Number(p.amount) || 0,
    notes: p.notes || null,
    personnelName: p.personnel?.name || null,
  }));
}

// Função principal: busca ambos e agrupa por semanas
export async function fetchPaymentForecast(params: { teamId: string; weeksAhead?: number }): Promise<WeekForecast[]> {
  const { teamId, weeksAhead = 3 } = params;
  const today = new Date();
  const startIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const end = new Date(today);
  end.setDate(today.getDate() + weeksAhead * 7);
  const endIso = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;

  const [events, avulsos] = await Promise.all([
    fetchEventForecast(teamId, startIso, endIso),
    fetchAvulsoForecast(teamId, startIso, endIso),
  ]);

  return groupItemsByWeek([...events, ...avulsos]);
}