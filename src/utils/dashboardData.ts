// Utilidades puras para derivação de dados do Dashboard
// Regra: manter funções puras e testáveis, sem dependência de contexts

export interface EventItem {
  id: string;
  status: string;
  start_date?: string; // ISO date (YYYY-MM-DD)
  end_date?: string;   // ISO date (YYYY-MM-DD)
  payment_due_date?: string; // ISO date (YYYY-MM-DD)
}

// Eventos em andamento: start_date <= now <= end_date
export function getEventsInProgress(events: EventItem[], now: Date = new Date()): EventItem[] {
  return events.filter((event) => {
    if (!event.start_date || !event.end_date) return false;
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    return startDate <= now && endDate >= now;
  });
}

// Pagamentos próximos: D+0 a D+15, exclui cancelados e eventos com pagamentos completos
// Inclui sempre status 'concluido_pagamento_pendente'
// Ordena com 'concluido_pagamento_pendente' primeiro e depois por data de vencimento
export function getUpcomingPayments(
  events: EventItem[],
  completedPaymentEventIds: string[],
  startDate: Date = new Date(),
  endDate: Date | null = null
): EventItem[] {
  const today = new Date(startDate);
  today.setHours(0, 0, 0, 0);

  const limit = endDate ? new Date(endDate) : new Date(today);
  if (!endDate) {
    limit.setDate(today.getDate() + 15);
  }
  limit.setHours(23, 59, 59, 999);

  const filtered = events.filter((event) => {
    // Excluir cancelados
    if (event.status === 'cancelado') return false;

    // Excluir eventos com pagamentos completos
    if (completedPaymentEventIds.includes(event.id)) return false;

    // Incluir sempre concluido_pagamento_pendente
    if (event.status === 'concluido_pagamento_pendente') return true;

    // Considerar data de vencimento ou fim do evento
    const dueDate = event.payment_due_date
      ? new Date(event.payment_due_date + 'T12:00:00')
      : event.end_date
      ? new Date(event.end_date + 'T12:00:00')
      : null;

    if (!dueDate) return false;

    // Incluir se vencimento <= limite (inclui atrasados)
    return dueDate <= limit;
  });

  return filtered.sort((a, b) => {
    const aPending = a.status === 'concluido_pagamento_pendente';
    const bPending = b.status === 'concluido_pagamento_pendente';
    if (aPending && !bPending) return -1;
    if (bPending && !aPending) return 1;

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
}

export interface KpiInput {
  events: EventItem[];
  personnelCount: number;
  functionsCount: number;
}

export interface KpiOutput {
  eventsCount: number;
  personnelCount: number;
  functionsCount: number;
}

export function computeDashboardKpis(input: KpiInput): KpiOutput {
  return {
    eventsCount: input.events.length,
    personnelCount: input.personnelCount,
    functionsCount: input.functionsCount,
  };
}